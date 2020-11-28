import { GuildSettings } from '#lib/database/index';
import { HardPunishment, ModerationMonitor } from '#lib/structures/ModerationMonitor';
import { Colors } from '#lib/types/constants/Constants';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';

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

	protected onAlert(message: GuildMessage, language: Language) {
		return message.alert(language.get(LanguageKeys.Monitors.AttachmentFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, language: Language) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${language.get(LanguageKeys.Monitors.AttachmentFilterFooter)}`)
			.setTimestamp();
	}
}
