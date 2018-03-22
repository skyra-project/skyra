const { Command } = require('../../index');
const { get } = require('snekfetch');

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/, REG_TWEMOJI = /^[^a-zA-Z0-9]{1,4}$/;

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
			const defractured = /^<a?:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
			const emojiName = defractured[1];
			const emojiID = defractured[2];
			const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

			return msg.sendMessage(msg.language.get('COMMAND_EMOJI_CUSTOM', emojiName, emojiID), { files: [{ attachment: emojiURL }] });
		}
		if (!REG_TWEMOJI.test(emoji))
			throw msg.language.get('COMMAND_EMOJI_INVALID', emoji);

		const r = this.emoji(emoji);

		const emojiURL = `https://twemoji.maxcdn.com/2/72x72/${r}.png`;
		const { body } = await get(emojiURL);

		return msg.sendMessage(msg.language.get('COMMAND_EMOJI_TWEMOJI', emoji, r), { files: [{ attachment: body, name: `${r}.png` }] });
	}

	emoji(emoji) {
		const r = [];
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

};
