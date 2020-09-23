import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { announcementCheck, extractMentions } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

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
	private readonly messages: WeakMap<KlasaMessage, KlasaMessage> = new WeakMap();

	public async run(message: KlasaMessage, [announcement]: [string]) {
		const announcementID = message.guild!.settings.get(GuildSettings.Channels.Announcements);
		if (!announcementID) throw message.language.get(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		const channel = message.guild!.channels.cache.get(announcementID) as TextChannel;
		if (!channel) throw message.language.get(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		if (!channel.postable) throw message.language.get(LanguageKeys.System.ChannelNotPostable);

		const role = announcementCheck(message);
		const header = message.language.get(LanguageKeys.Commands.Announcement.Announcement, { role: role.toString() });

		if (await this.ask(message, header, announcement)) {
			await this.send(message, channel, role, header, announcement);
			return message.sendLocale(LanguageKeys.Commands.Announcement.AnnouncementSuccess);
		}

		return message.sendLocale(LanguageKeys.Commands.Announcement.AnnouncementCancelled);
	}

	private ask(message: KlasaMessage, header: string, announcement: string) {
		try {
			return message.ask(message.language.get(LanguageKeys.Commands.Announcement.AnnouncementPrompt), {
				embed: this.buildEmbed(announcement, header)
			});
		} catch {
			return false;
		}
	}

	private async send(message: KlasaMessage, channel: TextChannel, role: Role, header: string, announcement: string) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const mentions = Reflect.has(message.flagArgs, 'excludeMentions') ? [] : [...new Set(extractMentions(announcement))];
		const shouldSendAsEmbed = message.guildSettings.get(GuildSettings.Messages.AnnouncementEmbed);

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = shouldSendAsEmbed
					? await previous.edit(
							mentions.length
								? message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
										header,
										mentions: message.language.list(mentions, message.language.get(LanguageKeys.Globals.And))
								  })
								: message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
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
									? message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
											header,
											mentions: message.language.list(mentions, message.language.get(LanguageKeys.Globals.And))
									  })
									: message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
											header
									  })
						  )
						: ((await channel.send(`${header}:\n${announcement}`)) as KlasaMessage);
					this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
					this.messages.set(message, resultMessage);
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
							? message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
									header,
									mentions: message.language.list(mentions, message.language.get(LanguageKeys.Globals.And))
							  })
							: message.language.get(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
									header
							  })
				  )
				: ((await channel.send(`${header}:\n${announcement}`)) as KlasaMessage);
			this.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
			this.messages.set(message, resultMessage);
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
