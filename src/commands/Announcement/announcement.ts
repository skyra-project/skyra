import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { map, seconds } from '#utils/common';
import { BrandingColors } from '#utils/constants';
import { promptConfirmation } from '#utils/functions';
import { announcementCheck, DetailedMentionExtractionResult, extractDetailedMentions } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages, GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { send } from '@skyra/editable-commands';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { DiscordAPIError, MessageEmbed, MessageOptions, Role } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['excludeMentions', 'em'];
const empty: DetailedMentionExtractionResult = { channels: new Set(), roles: new Set(), users: new Set() };

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['announce'],
	cooldownLimit: 6,
	cooldownDelay: seconds(30),
	description: LanguageKeys.Commands.Announcement.AnnouncementDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.AnnouncementExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: ['ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
	runIn: ['GUILD_ANY'],
	flags
})
export class UserCommand extends SkyraCommand {
	private readonly messages: WeakMap<GuildMessage, GuildMessage> = new WeakMap();

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const announcement = await args.rest('string', { max: 1950 });

		const [channelId, embedEnabled] = await readSettings(message.guild, [
			GuildSettings.Channels.Announcements,
			GuildSettings.Messages.AnnouncementEmbed
		]);
		if (!channelId) this.error(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		const channel = message.guild.channels.cache.get(channelId) as GuildTextBasedChannelTypes;
		if (!channel) this.error(LanguageKeys.Commands.Announcement.SubscribeNoChannel);

		if (!canSendMessages(channel)) this.error(LanguageKeys.System.ChannelNotPostable);

		const role = await announcementCheck(message);
		const header = args.t(LanguageKeys.Commands.Announcement.AnnouncementHeader, { role: role.toString() });

		if (await this.ask(message, args.t, header, announcement)) {
			await this.send(message, embedEnabled, channel, role, header, announcement, args);
			return send(message, args.t(LanguageKeys.Commands.Announcement.AnnouncementSuccess));
		}

		return send(message, args.t(LanguageKeys.Commands.Announcement.AnnouncementCancelled));
	}

	private async ask(message: GuildMessage, t: TFunction, header: string, announcement: string) {
		try {
			return promptConfirmation(message, {
				content: t(LanguageKeys.Commands.Announcement.AnnouncementPrompt),
				embeds: [this.buildEmbed(announcement, header)]
			});
		} catch {
			return false;
		}
	}

	private async send(
		message: GuildMessage,
		embedEnabled: boolean,
		channel: GuildTextBasedChannelTypes,
		role: Role,
		header: string,
		announcement: string,
		args: SkyraCommand.Args
	) {
		// If it's not mentionable, set, send/edit, and unset mentionable
		const { mentionable } = role;
		if (!mentionable) await role.edit({ mentionable: true });

		const detailedMentions = args.getFlags(...flags) ? empty : extractDetailedMentions(announcement);
		const mentions = [...map(detailedMentions.roles.values(), (id) => `<@&${id}>`), ...map(detailedMentions.users.values(), (id) => `<@${id}>`)];

		const { t } = args;
		const content = embedEnabled
			? mentions.length
				? t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentionsWithMentions, { header, mentions })
				: t(LanguageKeys.Commands.Announcement.AnnouncementEmbedMentions, { header })
			: `${header}:\n${announcement}`;
		const options: MessageOptions = {
			content,
			allowedMentions: {
				users: this.trim([...detailedMentions.users]),
				roles: this.trim(detailedMentions.roles.has(role.id) ? [...detailedMentions.roles] : [role.id, ...detailedMentions.roles])
			},
			embeds: embedEnabled ? [this.buildEmbed(announcement)] : undefined
		};

		// Retrieve last announcement if there was one
		const previous = this.messages.get(message);
		if (previous) {
			try {
				const resultMessage = await previous.edit(options);
				this.container.client.emit(Events.GuildAnnouncementEdit, message, resultMessage, channel, role, header);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
					const resultMessage = await channel.send(options);
					this.container.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
					this.messages.set(message, resultMessage as GuildMessage);
				} else {
					this.container.client.emit(Events.GuildAnnouncementError, message, channel, role, header, announcement, error);
					throw error;
				}
			}
		} else {
			const resultMessage = await channel.send(options);
			this.container.client.emit(Events.GuildAnnouncementSend, message, resultMessage, channel, role, header, announcement);
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

	private trim<T>(array: T[]) {
		return array.length <= 20 ? array : array.slice(0, 20);
	}
}
