import { GuildSettings } from '@lib/database';
import { DbSet } from '@lib/structures/DbSet';
import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock, cutText } from '@sapphire/utilities';
import { getCode, isUpper } from '@skyra/char';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';

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

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message) && message.content.length > 0;
	}

	protected async preProcess(message: GuildMessage) {
		const [minimumCapitals, maximumCapitals] = await message.guild!.readSettings([
			GuildSettings.Selfmod.Capitals.Minimum,
			GuildSettings.Selfmod.Capitals.Maximum
		]);

		if (minimumCapitals > message.content.length) return;

		let length = 0;
		let count = 0;

		for (const char of message.content) {
			const charCode = getCode(char);
			if (isUpper(charCode)) count++;
			length++;
		}

		return (count / length) * 100 >= maximumCapitals ? count : null;
	}

	protected async onDelete(message: GuildMessage, language: Language, value: number) {
		floatPromise(this, message.nuke());
		if (value > 25 && (await DbSet.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(language.get(LanguageKeys.Monitors.CapsFilterDm, { message: codeBlock('md', cutText(message.content, 1900)) }));
		}
	}

	protected onAlert(message: GuildMessage, language: Language) {
		return message.alert(language.get(LanguageKeys.Monitors.CapsFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, language: Language) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${language.get(LanguageKeys.Monitors.CapsfilterFooter)}`)
			.setTimestamp();
	}
}
