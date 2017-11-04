const { Command } = require('../../index');
const snekfetch = require('snekfetch');

/* eslint-disable no-bitwise */
/* eslint id-length: ["error", { "exceptions": ["r", "c", "p", "i"] }] */
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 2,
			cooldown: 10,

			usage: '<emoji:string>',
			description: 'Get info from an emoji.'
		});
	}

	async run(msg, [emoji], settings, i18n) {
		if (/^<:\w{2,32}:\d{17,21}>$/.test(emoji)) {
			const defractured = /^<:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
			const emojiName = defractured[1];
			const emojiID = defractured[2];
			const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

			return msg.send(i18n.get('COMMAND_EMOJI_CUSTOM', emojiName, emojiID), { files: [{ attachment: emojiURL }] });
		}
		if (/^[^a-zA-Z0-9]{1,4}$/.test(emoji) === false)
			throw i18n.get('COMMAND_EMOJI_INVALID', emoji);

		const r = this.emoji(emoji);

		const emojiURL = `https://twemoji.maxcdn.com/2/72x72/${r}.png`;
		const { body } = await snekfetch.get(emojiURL);

		return msg.send(i18n.get('COMMAND_EMOJI_TWEMOJI', emoji, r), { files: [{ attachment: body, name: `${r}.png` }] });
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
			} else if (c >= 0xD800 && c <= 0xDBFF)
				p = c;
			else
				r.push(c.toString(16));
		}
		return r.join('-');
	}

	resolveGuild(guild) {
		return `${guild.name} (${guild.id})`;
	}

};
