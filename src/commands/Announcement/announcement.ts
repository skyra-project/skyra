import { GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { announcementCheck, extractMentions } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['announce'],
	bucket: 6,
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Announcement.AnnouncementDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Announcement.AnnouncementExtended),
	permissionLevel: PermissionLevels.Administrator,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
	runIn: ['text'],
	usage: '<announcement:string{,1900}>',
	flagSupport: true
})
export default class extends SkyraCommand {
	private readonly messages: WeakMap<GuildMessage, GuildMessage> = new WeakMap();

	public async run(message: GuildMessage, [announcement]: [string]) {
		const [announcementID, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Announcements],
			settings.getLanguage()
		]);
		if (!announcementID) throw language.get(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		const channel = message.guild.channels.cache.get(announcementID) as TextChannel;
		if (!channel) throw language.get(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		if (!channel.postable) throw language.get(LanguageKeys.System.ChannelNotPostable);

		const role = await announcementCheck(message);
		const header = language.get(LanguageKeys.Commands.Announcement.Announcement, { role: role.toString() });

		if (await this.ask(message, header, announcement)) {
			await this.send(message, channel, role, header, announcement);
			return message.sendLocale(LanguageKeys.Commands.Announcement.AnnouncementSuccess);
		}

		return message.sendLocale(LanguageKeys.Commands.Announcement.AnnouncementCancelled);
	}

	private async ask(message: GuildMessage, header: string, announcement: string) {
		const language = await message.fetchLanguage();
		try {
			return message.ask(language.get(LanguageKeys.Commands.Announcement.AnnouncementPrompt), {
				embed: this.buildEmbed(announcement, header)
			});
		} catch {
			return false;
		}
	}

	private async send(message: GuildMessage, channel: TextChannel, role: Role, header: string, announcement: string) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const mentions = Reflect.has(message.flagArgs, 'excludeMentions') ? [] : [...new Set(extractMentions(announcement))];

		const [shouldSendAsEmbed, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.AnnouncementEmbed],
			settings.getLanguage()
		]);

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = shouldSendAsEmbed
					? await previous.edit(
							mentions.length
								? language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
										header,
										mentions: language.list(mentions, await message.fetchLocale(LanguageKeys.Globals.And))
								  })
								: language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
										header
								  }),
							this.buildEmbed(announcement)
					  )
					: await previous.edit(`${header}:\n${announcement}`);
				this.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, header);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
					const resultMessage = shouldSendAsEmbed
						? await channel.sendEmbed(
								this.buildEmbed(announcement),
								mentions.length
									? language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
											header,
											mentions: language.list(mentions, language.get(LanguageKeys.Globals.And))
									  })
									: language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
											header
									  })
						  )
						: ((await channel.send(`${header}:\n${announcement}`)) as GuildMessage);
					this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
					this.messages.set(message, resultMessage as GuildMessage);
				} else {
					this.client.emit(Events.GuildAnnouncementError, message, channel, role, header, announcement, error);
					throw error;
				}
			}
		} else {
			const resultMessage = shouldSendAsEmbed
				? await channel.sendEmbed(
						this.buildEmbed(announcement),
						mentions.length
							? language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
									header,
									mentions: language.list(mentions, language.get(LanguageKeys.Globals.And))
							  })
							: language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
									header
							  })
				  )
				: ((await channel.send(`${header}:\n${announcement}`)) as GuildMessage);
			this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
			this.messages.set(message, resultMessage as GuildMessage);
		}

		if (!mentionable) await role.edit({ mentionable: false });
	}

	private buildEmbed(announcement: string, header = '') {
		return new MessageEmbed()
			.setColor(BrandingColors.Primary)
			.setDescription(`${header ? `${header}\n` : ''}${announcement}`)
			.setTimestamp();
	}
}
