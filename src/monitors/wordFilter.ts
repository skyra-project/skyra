import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor, util } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { cutText } from '../lib/util/util';

const ALERT_FLAG = 1 << 2;
const LOG_FLAG = 1 << 1;
const DELETE_FLAG = 1 << 0;

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		const level = message.guild.settings.get(GuildSettings.Filter.Level) as GuildSettings.Filter.Level;
		if (!level) return;

		if (await message.hasAtLeastPermissionLevel(5)) return;

		const results = this.filter(message.content, message.guild.security.regexp);
		if (results === null) return;

		if ((level & DELETE_FLAG) && message.deletable) {
			if (message.content.length > 25) {
				message.author.send(message.language.get('MONITOR_WORDFILTER_DM',
					util.codeBlock('md', cutText(results.filtered, 1900)))).catch(() => null);
			}
			message.nuke().catch(() => null);
		}

		if ((level & ALERT_FLAG) && message.channel.postable) {
			message.alert(message.language.get('MONITOR_WORDFILTER', message.author)).catch(() => null);
		}

		if (level & LOG_FLAG) {
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, message.guild, () => new MessageEmbed()
				.splitFields(cutText(results.highlighted, 4000))
				.setColor(0xEFAE45)
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
				.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get('CONST_MONITOR_WORDFILTER')}`)
				.setTimestamp());
		}
	}

	public shouldRun(message: KlasaMessage): boolean {
		if (!this.enabled || !message.guild || message.author.id === this.client.user.id || !message.guild.security.regexp) return false;

		const ignoreChannels = message.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels) as GuildSettings.Selfmod.IgnoreChannels;
		return !ignoreChannels.includes(message.channel.id);
	}

	private filter(str: string, regex: RegExp): { filtered: string; highlighted: string } | null {
		const matches = str.match(regex);
		if (matches === null) return null;

		let last = 0;
		let next = 0;

		const filtered = [];
		const highlighted = [];
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
