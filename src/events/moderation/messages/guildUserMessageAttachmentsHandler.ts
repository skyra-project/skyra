import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageEvent } from '#lib/structures/moderation/ModerationMessageEvent';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ModerationMessageEvent.Options>({
	reasonLanguageKey: LanguageKeys.Monitors.ModerationAttachments,
	reasonLanguageKeyWithMaximum: LanguageKeys.Monitors.ModerationAttachmentsWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Attachments.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Attachments.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Attachments.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Attachments.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Attachments.HardAction,
		actionDuration: GuildSettings.Selfmod.Attachments.HardActionDuration,
		adder: 'attachments'
	}
})
export default class extends ModerationMessageEvent {
	protected preProcess(message: GuildMessage) {
		const attachments = message.attachments.size;
		return attachments > 0 ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return message.nuke();
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Monitors.AttachmentFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Monitors.AttachmentFilterFooter)}`)
			.setTimestamp();
	}
}
