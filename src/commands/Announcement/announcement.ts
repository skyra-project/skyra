import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { announcementCheck, extractMentions } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['announce'],
	bucket: 6,
	cooldown: 30,
	description: LanguageKeys.Commands.Announcement.AnnouncementDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.AnnouncementExtended,
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
		const [channelID, embedEnabled, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Announcements],
			settings[GuildSettings.Messages.AnnouncementEmbed],
			settings.getLanguage()
		]);
		if (!channelID) throw t(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		const channel = message.guild.channels.cache.get(channelID) as TextChannel;
		if (!channel) throw t(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		if (!channel.postable) throw t(LanguageKeys.System.ChannelNotPostable);

		const role = await announcementCheck(message);
		const header = t(LanguageKeys.Commands.Announcement.AnnouncementHeader, { role: role.toString() });

		if (await this.ask(message, t, header, announcement)) {
			await this.send(message, t, embedEnabled, channel, role, header, announcement);
			return message.send(t(LanguageKeys.Commands.Announcement.AnnouncementSuccess));
		}

		return message.send(t(LanguageKeys.Commands.Announcement.AnnouncementCancelled));
	}

	private async ask(message: GuildMessage, t: TFunction, header: string, announcement: string) {
		try {
			return message.ask(t(LanguageKeys.Commands.Announcement.AnnouncementPrompt), {
				embed: this.buildEmbed(announcement, header)
			});
		} catch {
			return false;
		}
	}

	private async send(
		message: GuildMessage,
		t: TFunction,
		embedEnabled: boolean,
		channel: TextChannel,
		role: Role,
		header: string,
		announcement: string
	) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const mentions = Reflect.has(message.flagArgs, 'excludeMentions') ? [] : [...new Set(extractMentions(announcement))];

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = embedEnabled
					? await previous.edit(
							mentions.length
								? t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
										header,
										mentions
								  })
								: t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
										header
								  }),
							this.buildEmbed(announcement)
					  )
					: await previous.edit(`${header}:\n${announcement}`);
				this.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, header);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
					const resultMessage = embedEnabled
						? await channel.send(
								mentions.length
									? t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
											header,
											mentions
									  })
									: t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
											header
									  }),
								this.buildEmbed(announcement)
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
			const resultMessage = embedEnabled
				? await channel.send(
						mentions.length
							? t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, {
									header,
									mentions
							  })
							: t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, {
									header
							  }),
						this.buildEmbed(announcement)
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
