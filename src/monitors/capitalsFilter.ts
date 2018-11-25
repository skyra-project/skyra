import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor, SettingsFolder, util } from 'klasa';
import { MessageLogsEnum } from '../lib/util/constants';
import { cutText } from '../lib/util/util';
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

const ALERT_FLAG = 1 << 2, LOG_FLAG = 1 << 1, DELETE_FLAG = 1 << 0;

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		if (await message.hasAtLeastPermissionLevel(5)) return;

		const selfmod = (message.guild.settings.get('selfmod') as SettingsFolder).pluck('capsfilter', 'capsthreshold');
		const { length } = message.content;
		let count = 0, i = 0;

		// eslint-disable-next-line no-bitwise
		while (i < length) if ((message.content.charCodeAt(i++) & OFFSET) === 0) count++;

		if ((count / length) * 100 < selfmod.capsthreshold) return;

		// eslint-disable-next-line no-bitwise
		if ((selfmod.capsfilter & DELETE_FLAG) && message.deletable) {
			if (length > 25) message.author.send(message.language.get('MONITOR_CAPSFILTER_DM', util.codeBlock('md', cutText(message.content, 1900)))).catch(() => null);
			message.nuke().catch(() => null);
		}

		// eslint-disable-next-line no-bitwise
		if ((selfmod.capsfilter & ALERT_FLAG) && message.channel.postable)
			message.alert(message.language.get('MONITOR_CAPSFILTER', message.author)).catch(() => null);

		// eslint-disable-next-line no-bitwise
		if (selfmod.capsfilter & LOG_FLAG) {
			this.client.emit('guildMessageLog', MessageLogsEnum.Moderation, message.guild, () => new MessageEmbed()
				.splitFields(message.content)
				.setColor(0xEFAE45)
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
				.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get('CONST_MONITOR_CAPSFILTER')}`)
				.setTimestamp());
		}
	}

	public shouldRun(message: KlasaMessage): boolean {
		if (!this.enabled || !message.guild || message.author.id === this.client.user.id) return false;

		const selfmod = (message.guild.settings.get('selfmod') as SettingsFolder).pluck('capsminimum', 'capsfilter', 'ignoreChannels');
		return message.content.length > selfmod.capsminimum && selfmod.capsfilter && !selfmod.ignoreChannels.includes(message.channel.id);
	}

}
