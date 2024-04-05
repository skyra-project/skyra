import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { TextChannel } from 'discord.js';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationAttachments,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationAttachmentsWithMaximum,
	keyEnabled: GuildSettings.AutoModeration.Attachments.Enabled,
	ignoredChannelsPath: GuildSettings.AutoModeration.Attachments.IgnoredChannels,
	ignoredRolesPath: GuildSettings.AutoModeration.Attachments.IgnoredRoles,
	softPunishmentPath: GuildSettings.AutoModeration.Attachments.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.AutoModeration.Attachments.HardAction,
		actionDuration: GuildSettings.AutoModeration.Attachments.HardActionDuration,
		adder: 'attachments'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	protected preProcess(message: GuildMessage): 1 | null {
		const attachments = message.attachments.size;
		return attachments > 0 ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return deleteMessage(message);
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.AttachmentFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new EmbedBuilder()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(message.author, message.url))
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.AttachmentFilterFooter)}` })
			.setTimestamp();
	}
}
