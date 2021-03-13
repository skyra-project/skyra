import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { announcementCheck, DetailedMentionExtractionResult, extractDetailedMentions } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageEmbed, Role, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['excludeMentions', 'em'];
const empty: DetailedMentionExtractionResult = { channels: new Set(), roles: new Set(), users: new Set() };

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['announce'],
	bucket: 6,
	cooldown: 30,
	description: LanguageKeys.Commands.Announcement.AnnouncementDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.AnnouncementExtended,
	permissionLevel: PermissionLevels.Administrator,
	permissions: ['ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
	runIn: ['text'],
	strategyOptions: { flags }
})
export class UserCommand extends SkyraCommand {
	private readonly messages: WeakMap<GuildMessage, GuildMessage> = new WeakMap();

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const announcement = await args.rest('string', { max: 1950 });

		const [channelID, embedEnabled] = await message.guild.readSettings([
			GuildSettings.Channels.Announcements,
			GuildSettings.Messages.AnnouncementEmbed
		]);
		if (!channelID) this.error(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		const channel = message.guild.channels.cache.get(channelID) as TextChannel;
		if (!channel) this.error(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		if (!channel.postable) this.error(LanguageKeys.System.ChannelNotPostable);

		const role = await announcementCheck(message);
		const header = args.t(LanguageKeys.Commands.Announcement.AnnouncementHeader, { role: role.toString() });

		if (await this.ask(message, args.t, header, announcement)) {
			await this.send(message, embedEnabled, channel, role, header, announcement, args);
			return message.send(args.t(LanguageKeys.Commands.Announcement.AnnouncementSuccess));
		}

		return message.send(args.t(LanguageKeys.Commands.Announcement.AnnouncementCancelled));
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
		embedEnabled: boolean,
		channel: TextChannel,
		role: Role,
		header: string,
		announcement: string,
		args: SkyraCommand.Args
	) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const detailedMentions = args.getFlags(...flags) ? empty : extractDetailedMentions(announcement);
		const mentions = [...detailedMentions.channels, ...detailedMentions.users];

		const { t } = args;
		const content = embedEnabled
			? `${header}:\n${announcement}`
			: mentions.length
			? t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, { header, mentions })
			: t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, { header });
		const options = {
			allowedMentions: { users: [...detailedMentions.users], roles: [role.id, ...mentions] },
			embed: embedEnabled ? this.buildEmbed(announcement) : undefined
		};

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = await previous.edit(content, options);
				this.context.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, header);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
					const resultMessage = await channel.send(content, options);
					this.context.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
					this.messages.set(message, resultMessage as GuildMessage);
				} else {
					this.context.client.emit(Events.GuildAnnouncementError, message, channel, role, header, announcement, error);
					throw error;
				}
			}
		} else {
			const resultMessage = await channel.send(content, options);
			this.context.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
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
