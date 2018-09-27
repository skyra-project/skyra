const { Monitor, MessageEmbed, klasaUtil: { codeBlock }, util: { cutText }, constants: { MESSAGE_LOGS } } = require('../index');
const OFFSET = 0b100000;
/**
 * In ASCII, the 6th bit tells whether a character is lowercase or uppercase:
 *
 * 'a': 97 (1100001)
 * 'A': 65 (1000001)
 *
 * So the most efficient way to check if a character is uppercase is by checking
 * it. In this version, we use the AND bitwise operator to change the value of the
 * 6th bit to 1 and then checking if it is equal to the original number.
 *
 * To sum up: Doing the operation `code & 223` converts any ASCII character from
 * lower case to upper case (upper case characters are unaffected).
 */

// eslint-disable-next-line no-bitwise
const ALERT_FLAG = 1 << 2, LOG_FLAG = 1 << 1, DELETE_FLAG = 1 << 0;

export default class extends Monitor {

	public async run(msg) {
		if (await msg.hasAtLeastPermissionLevel(5)) return;

		const { selfmod } = msg.guild.settings;
		const { length } = msg.content;
		let count = 0, i = 0;

		// eslint-disable-next-line no-bitwise
		while (i < length) if ((msg.content.charCodeAt(i++) & OFFSET) === 0) count++;

		if ((count / length) * 100 < selfmod.capsthreshold) return;

		// eslint-disable-next-line no-bitwise
		if ((selfmod.capsfilter & DELETE_FLAG) && msg.deletable) {
			if (length > 25) msg.author.send(msg.language.get('MONITOR_CAPSFILTER_DM', codeBlock('md', cutText(msg.content, 1900)))).catch(() => null);
			msg.nuke().catch(() => null);
		}

		// eslint-disable-next-line no-bitwise
		if ((selfmod.capsfilter & ALERT_FLAG) && msg.channel.postable)
			msg.alert(msg.language.get('MONITOR_CAPSFILTER', msg.author)).catch(() => null);

		// eslint-disable-next-line no-bitwise
		if (selfmod.capsfilter & LOG_FLAG) {
			this.client.emit('guildMessageLog', MESSAGE_LOGS.kModeration, msg.guild, () => new MessageEmbed()
				.splitFields(msg.content)
				.setColor(0xefae45)
				.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
				.setFooter(`#${msg.channel.name} | ${msg.language.get('CONST_MONITOR_CAPSFILTER')}`)
				.setTimestamp());
		}
	}

	public shouldRun(msg) {
		if (!this.enabled || !msg.guild || msg.author.id === this.client.user.id) return false;

		const { selfmod } = msg.guild.settings;
		return msg.content.length > selfmod.capsminimum && selfmod.capsfilter && !selfmod.ignoreChannels.includes(msg.channel.id);
	}

}
