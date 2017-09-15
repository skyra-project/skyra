const { Command, config } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

const key = config.tokens.google;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['shortenurl', 'googleshorturl', 'shorten'],
            botPerms: ['EMBED_LINKS'],
            mode: 2,
            cooldown: 15,

            usage: '<URL:url>',
            description: 'Short your links with this tool.',
            extendedHelp: Command.strip`
                Shorten your urls with Googl!

                ⚙ | ***Explained usage***
                Skyra, googl [url]
                URL :: The URL to short or long.

                = Reminder =
                This command automatically detects when the URL providen is from googl or external.

                = Examples =
                • Skyra, googl https://github.com/
                    https://goo.gl/un5E
                • Skyra, googl https://goo.gl/un5E
                    https://github.com/
            `
        });
    }

    async run(msg, [url], settings, i18n) {
        const embed = new MessageEmbed()
            .setTimestamp();

        if (/^https:\/\/goo\.gl\/.+/.test(url))
            embed.setDescription(await this.short(url, i18n));
        else
            embed.setDescription(await this.long(url, i18n));

        return msg.send({ embed });
    }

    async long(url, i18n) {
        const { id } = await snekfetch.post(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`).send({ longUrl: url }).then(data => JSON.parse(data.text));
        return i18n.get('COMMAND_GOOGL_LONG', id);
    }

    async short(url, i18n) {
        const { longUrl } = await snekfetch.get(`https://www.googleapis.com/urlshortener/v1/url?key=${key}&shortUrl=${url}`).then(data => JSON.parse(data.text));
        return i18n.get('COMMAND_GOOGL_SHORT', longUrl);
    }

};
