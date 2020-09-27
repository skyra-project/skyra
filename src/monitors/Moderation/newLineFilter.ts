import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { Colors } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { floatPromise, getContent } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const NEW_LINE = '\n';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationNewLine;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationNewLineWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.NewLines.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.NewLines.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.NewLines.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.NewLines.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.NewLines.HardAction,
		actionDuration: GuildSettings.Selfmod.NewLines.HardActionDuration,
		adder: 'newlines',
		adderMaximum: GuildSettings.Selfmod.NewLines.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.NewLines.ThresholdDuration
	};

	protected preProcess(message: KlasaMessage) {
		const threshold = message.guild!.settings.get(GuildSettings.Selfmod.NewLines.Maximum);
		if (threshold === 0) return null;

		const content = getContent(message);
		if (content === null) return null;

		let count = 0;
		for (let index = -2; index !== -1; index = content.indexOf(NEW_LINE, index + 1)) count++;

		return count > threshold ? count : null;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.get(LanguageKeys.Monitors.NewLineFilter, { user: message.author.toString() })));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get(LanguageKeys.Monitors.NewLineFooter)}`)
			.setTimestamp();
	}
}
