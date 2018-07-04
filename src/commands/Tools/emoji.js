const { Command, util: { fetch } } = require('../../index');

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/, REG_TWEMOJI = /^[^a-zA-Z0-9]{1,11}$/;

/* eslint-disable no-bitwise */
/* eslint id-length: ["error", { "exceptions": ["r", "c", "p", "i"] }] */
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_EMOJI_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_EMOJI_EXTENDED'),
			usage: '<emoji:string>'
		});
	}

	async run(msg, [emoji]) {
		if (REG_EMOJI.test(emoji)) {
			const [, animated, emojiName, emojiID] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
			return msg.sendMessage(msg.language.get('COMMAND_EMOJI_CUSTOM', emojiName, emojiID), { files: [{ attachment: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }] });
		}

		if (!REG_TWEMOJI.test(emoji)) throw msg.language.get('COMMAND_EMOJI_INVALID', emoji);
		const r = this.emoji(emoji);
		const buffer = await fetch(`https://twemoji.maxcdn.com/2/72x72/${r}.png`, 'buffer')
			.catch(() => { throw msg.language.get('COMMAND_EMOJI_INVALID', emoji); });

		return msg.sendMessage(msg.language.get('COMMAND_EMOJI_TWEMOJI', emoji, r), { files: [{ attachment: buffer, name: `${r}.png` }] });
	}

	emoji(emoji) {
		const r = [];
		let c = 0, p = 0, i = 0;

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

};
