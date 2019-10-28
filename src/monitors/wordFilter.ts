import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, util } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { cutText, getContent, floatPromise } from '../lib/util/util';
import { remove } from 'confusables';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends ModerationMonitor {

	protected keyEnabled: string = GuildSettings.Selfmod.Filter.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Filter.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Filter.HardAction,
		actionDuration: GuildSettings.Selfmod.Filter.HardActionDuration,
		adder: 'words',
		adderMaximum: GuildSettings.Selfmod.Filter.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Filter.ThresholdDuration
	};

	public shouldRun(message: KlasaMessage) {
		return super.shouldRun(message)
			&& message.guild!.security.regexp !== null;
	}

	protected preProcess(message: KlasaMessage) {
		const content = getContent(message);
		if (content === null) return null;

		return this.filter(remove(content), message.guild!.security.regexp!);
	}

	protected async onDelete(message: KlasaMessage, value: FilterResults) {
		floatPromise(this, message.nuke());
		if (message.content.length > 25 && (await message.author.settings.sync()).get(UserSettings.ModerationDM)) {
			floatPromise(this, message.author.sendLocale('MONITOR_WORDFILTER_DM', [util.codeBlock('md', cutText(value.filtered, 1900))]));
		}
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_WORDFILTER', message.author.toString())));
	}

	protected onLogMessage(message: KlasaMessage, results: FilterResults) {
		return new MessageEmbed()
			.splitFields(cutText(results.highlighted, 4000))
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_WORDFILTER')}`)
			.setTimestamp();
	}

	private filter(str: string, regex: RegExp): FilterResults | null {
		const matches = str.match(regex);
		if (matches === null) return null;

		let last = 0;
		let next = 0;

		const filtered: string[] = [];
		const highlighted: string[] = [];
		for (const match of matches) {
			next = str.indexOf(match, last);
			const section = str.slice(last, next);
			if (section) {
				filtered.push(section, '*'.repeat(match.length));
				highlighted.push(section, `__${match}__`);
			} else {
				filtered.push('*'.repeat(match.length));
				highlighted.push(`__${match}__`);
			}
			last = next + match.length;
		}

		if (last !== str.length) {
			const end = str.slice(last);
			filtered.push(end);
			highlighted.push(end);
		}

		return {
			filtered: filtered.join(''),
			highlighted: highlighted.join('')
		};
	}

}

interface FilterResults {
	filtered: string;
	highlighted: string;
}
