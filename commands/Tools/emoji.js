const { Command } = require('../../index');
const snekfetch = require('snekfetch');

/* eslint-disable class-methods-use-this, no-bitwise */
/* eslint id-length: ["error", { "exceptions": ["r", "c", "p", "i"] }] */
module.exports = class Emoji extends Command {

    constructor(...args) {
        super(...args, 'emoji', {
            mode: 2,

            usage: '<emoji:string>',
            description: 'Get info from an emoji.'
        });
    }

    async run(msg, [emoji]) {
        if (/^<:\w{2,32}:\d{17,21}>$/.test(emoji)) {
            const defractured = /^<:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
            const emojiName = defractured[1];
            const emojiID = defractured[2];
            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

            return msg.send([
                `Emoji: **${emojiName}**`,
                'Type: **Custom**',
                `ID: **${emojiID}**`,
                `Guild: ${this.client.emojis.has(emojiID) ? this.resolveGuild(this.client.emojis.get(emojiID).guild) : 'Unknown.'}`
            ].join('\n'), { files: [{ attachment: emojiURL }] });
        }
        if (!/^[^a-zA-Z0-9]{1,4}$/.test(emoji)) throw `${emoji} is not a valid emoji.`;
        const r = this.emoji(emoji);

        const emojiURL = `https://twemoji.maxcdn.com/2/72x72/${r}.png`;
        const { body } = await snekfetch.get(emojiURL);

        return msg.send([
            `Emoji: \\${emoji}`,
            'Type: **Twemoji**',
            `ID: **${r}**`
        ].join('\n'), { files: [{ attachment: body, name: `${r}.png` }] });
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
            } else if (c >= 0xD800 && c <= 0xDBFF) p = c;
            else r.push(c.toString(16));
        }
        return r.join('-');
    }

    resolveGuild(guild) {
        return `${guild.name} (${guild.id})`;
    }

};
