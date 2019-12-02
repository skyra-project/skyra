import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { announcementCheck, getColor } from '../../lib/util/util';
import { APIErrors } from '../../lib/util/constants';
import { Events } from '../../lib/types/Enums';

export default class extends SkyraCommand {

	private readonly messages: WeakMap<KlasaMessage, KlasaMessage> = new WeakMap();

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['announce'],
			bucket: 6,
			cooldown: 30,
			description: language => language.tget('COMMAND_ANNOUNCEMENT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ANNOUNCEMENT_EXTENDED'),
			permissionLevel: 4,
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			usage: '<announcement:string{,1900}>'
		});
	}

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
				embed: new MessageEmbed()
					.setColor(getColor(message))
					.setDescription(content)
					.setTimestamp()
			});
		} catch {
			return false;
		}
	}

	private async send(message: KlasaMessage, channel: TextChannel, role: Role, content: string) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = await previous.edit(content) as KlasaMessage;
				// TODO(Quantum): Implement event
				this.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, content);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === APIErrors.UnknownMessage) {
					const resultMessage = await channel.send(content) as KlasaMessage;
					this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, content);
					this.messages.set(message, resultMessage);
				} else {
					// TODO(Quantum): Implement event
					this.client.emit(Events.GuildAnnouncementError, message, channel, role, content, error);
					throw error;
				}
			}
		} else {
			const resultMessage = await channel.send(content) as KlasaMessage;
			this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, content);
			this.messages.set(message, resultMessage);
		}

		if (!mentionable) await role.edit({ mentionable: false });
	}

}
