import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationMonitor } from '#lib/structures/moderation/ModerationMonitor';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { MessageEmbed, TextChannel } from 'discord.js';
import { TFunction } from 'i18next';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationAttachments;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationAttachmentsWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Attachments.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Attachments.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Attachments.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Attachments.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Attachments.HardAction,
		actionDuration: GuildSettings.Selfmod.Attachments.HardActionDuration,
		adder: 'attachments'
	};

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message) && message.attachments.size > 0;
	}

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
