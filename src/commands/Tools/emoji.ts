import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/;
const REG_TWEMOJI = /^[^a-zA-Z0-9]{1,11}$/;
const MAX_EMOJI_SIZE = 1024 * 1024 * 8;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_EMOJI_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_EMOJI_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<emoji:string>'
		});
	}

	public async run(message: KlasaMessage, [emoji]: [string]) {
		if (REG_EMOJI.test(emoji)) {
			const [, animated, emojiName, emojiID] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji)!;
			return message.sendLocale('COMMAND_EMOJI_CUSTOM', [emojiName, emojiID], {
				files: [{ attachment: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }]
			});
		}

		if (!REG_TWEMOJI.test(emoji)) throw message.language.tget('COMMAND_EMOJI_INVALID', emoji);
		const r = this.emoji(emoji);
		const buffer = await fetch(`https://twemoji.maxcdn.com/2/72x72/${r}.png`, 'buffer')
			.catch(() => { throw message.language.tget('COMMAND_EMOJI_INVALID', emoji); });

		if (buffer.byteLength >= MAX_EMOJI_SIZE) throw message.language.tget('COMMAND_EMOJI_TOO_LARGE', emoji);

		return message.sendLocale('COMMAND_EMOJI_TWEMOJI', [emoji, r], { files: [{ attachment: buffer, name: `${r}.png` }] });
	}

	public emoji(emoji: string) {
		const r: string[] = [];
		let c = 0;
		let p = 0;
		let i = 0;

		while (i < emoji.length) {
			c = emoji.charCodeAt(i++);
			if (p) {
				r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
				p = 0;
			} else if (c >= 0xD800 && c <= 0xDBFF) {
				p = c;
			} else {
				r.push(c.toString(16));
			}
		}
		return r.join('-');
	}

}
