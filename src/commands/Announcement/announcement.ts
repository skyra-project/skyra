import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { APIErrors } from '@utils/constants';
import { announcementCheck, extractMentions, getColor } from '@utils/util';
import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['announce'],
	bucket: 6,
	cooldown: 30,
	description: language => language.tget('COMMAND_ANNOUNCEMENT_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ANNOUNCEMENT_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
	runIn: ['text'],
	usage: '<announcement:string{,1900}>',
	flagSupport: true
})
export default class extends SkyraCommand {

	private readonly messages: WeakMap<KlasaMessage, KlasaMessage> = new WeakMap();

	public async run(message: KlasaMessage, [announcement]: [string]) {
		const announcementID = message.guild!.settings.get(GuildSettings.Channels.Announcements);
		if (!announcementID) throw message.language.tget('COMMAND_SUBSCRIBE_NO_CHANNEL');

		const channel = message.guild!.channels.get(announcementID) as TextChannel;
		if (!channel) throw message.language.tget('COMMAND_SUBSCRIBE_NO_CHANNEL');

		if (!channel.postable) throw message.language.tget('SYSTEM_CHANNEL_NOT_POSTABLE');

		const role = announcementCheck(message);
		const content = `${message.language.tget('COMMAND_ANNOUNCEMENT', role.toString())}\n${announcement}`;

		if (await this.ask(message, content)) {
			await this.send(message, channel, role, content);
			return message.sendLocale('COMMAND_ANNOUNCEMENT_SUCCESS');
		}

		return message.sendLocale('COMMAND_ANNOUNCEMENT_CANCELLED');
	}

	private ask(message: KlasaMessage, content: string) {
		try {
			return message.ask(message.language.tget('COMMAND_ANNOUNCEMENT_PROMPT'), {
				embed: this.buildEmbed(message, content)
			});
		} catch {
			return false;
		}
	}

	private async send(message: KlasaMessage, channel: TextChannel, role: Role, content: string) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const mentions = Reflect.has(message.flagArgs, 'excludeMentions') ? null : extractMentions(content).join(' ');
		const shouldSendAsEmbed = message.guildSettings.get(GuildSettings.Messages.AnnouncementEmbed);

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = shouldSendAsEmbed
					? await previous.edit(mentions, this.buildEmbed(message, content))
					: await previous.edit(content);
				this.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, content);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === APIErrors.UnknownMessage) {
					const resultMessage = shouldSendAsEmbed
						? await channel.sendEmbed(this.buildEmbed(message, content), mentions)
						: await channel.send(content) as KlasaMessage;
					this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, content);
					this.messages.set(message, resultMessage);
				} else {
					this.client.emit(Events.GuildAnnouncementError, message, channel, role, content, error);
					throw error;
				}
			}
		} else {
			const resultMessage = shouldSendAsEmbed
				? await channel.sendEmbed(this.buildEmbed(message, content), mentions)
				: await channel.send(content) as KlasaMessage;
			this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, content);
			this.messages.set(message, resultMessage);
		}

		if (!mentionable) await role.edit({ mentionable: false });
	}

	private buildEmbed(message: KlasaMessage, content: string) {
		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(content)
			.setTimestamp();
	}

}
