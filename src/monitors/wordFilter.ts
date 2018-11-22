import { Monitor, MessageEmbed, klasaUtil: { codeBlock }, discordUtil: { escapeMarkdown }, util: { cutText }, constants: { MESSAGE_LOGS } } from '../index';
import { diffWordsWithSpace } from 'diff';

// eslint-disable-next-line no-bitwise
const ALERT_FLAG = 1 << 2, LOG_FLAG = 1 << 1, DELETE_FLAG = 1 << 0;

export default class extends Monitor {

	async run(msg) {
		if (await msg.hasAtLeastPermissionLevel(5)) return;

		const { filter } = msg.guild.settings;
		const filtered = msg.content.replace(filter.regexp, match => '*'.repeat(match.length));
		if (filtered === msg.content) return;

		// eslint-disable-next-line no-bitwise
		if ((filter.level & DELETE_FLAG) && msg.deletable) {
			if (filtered.length > 25) msg.author.send(msg.language.get('MONITOR_WORDFILTER_DM', codeBlock('md', cutText(filtered, 1900)))).catch(() => null);
			msg.nuke().catch(() => null);
		}

		// eslint-disable-next-line no-bitwise
		if ((filter.level & ALERT_FLAG) && msg.channel.postable)
			msg.alert(msg.language.get('MONITOR_WORDFILTER', msg.author)).catch(() => null);

		// eslint-disable-next-line no-bitwise
		if (filter.level & LOG_FLAG) {
			this.client.emit('guildMessageLog', MESSAGE_LOGS.kModeration, msg.guild, () => new MessageEmbed()
				.splitFields(cutText(diffWordsWithSpace(msg.content, filtered)
					.map(result => result.removed ? `__${escapeMarkdown(result.value)}__` : !result.added ? escapeMarkdown(result.value) : '')
					.join(''), 4000))
				.setColor(0xefae45)
				.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
				.setFooter(`#${msg.channel.name} | ${msg.language.get('CONST_MONITOR_WORDFILTER')}`)
				.setTimestamp());
		}
	}

	shouldRun(msg) {
		if (!this.enabled || !msg.guild || msg.author.id === this.client.user.id) return false;

		const { selfmod, filter } = msg.guild.settings;
		return filter.level !== 0 && filter.regexp !== null && !selfmod.ignoreChannels.includes(msg.channel.id);
	}

};
