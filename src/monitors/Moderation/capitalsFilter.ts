import { DbSet } from '@lib/structures/DbSet';
import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { Colors } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock, cutText } from '@sapphire/utilities';
import { getCode, isUpper } from '@skyra/char';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationCapitals;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationCapitalsWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Capitals.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Capitals.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Capitals.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Capitals.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Capitals.HardAction,
		actionDuration: GuildSettings.Selfmod.Capitals.HardActionDuration,
		adder: 'capitals',
		adderMaximum: GuildSettings.Selfmod.Capitals.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Capitals.ThresholdDuration
	};

	public shouldRun(message: KlasaMessage) {
		return (
			super.shouldRun(message) &&
			message.content.length > 0 &&
			message.guild!.settings.get(GuildSettings.Selfmod.Capitals.Minimum) < message.content.length
		);
	}

	protected preProcess(message: KlasaMessage) {
		const capsthreshold = message.guild!.settings.get(GuildSettings.Selfmod.Capitals.Maximum);
		let length = 0;
		let count = 0;

		for (const char of message.content) {
			const charCode = getCode(char);
			if (isUpper(charCode)) count++;
			length++;
		}

		return (count / length) * 100 >= capsthreshold ? count : null;
	}

	protected async onDelete(message: KlasaMessage, value: number) {
		floatPromise(this, message.nuke());
		if (value > 25 && (await DbSet.fetchModerationDirectMessageEnabled(message.author.id))) {
			floatPromise(
				this,
				message.author.sendLocale(LanguageKeys.Monitors.CapsFilterDm, [{ message: codeBlock('md', cutText(message.content, 1900)) }])
			);
		}
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.get(LanguageKeys.Monitors.CapsFilter, { user: message.author.toString() })));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get(LanguageKeys.Monitors.CapsfilterFooter)}`)
			.setTimestamp();
	}
}
