const { Command, Constants, Discord: { Embed } } = require('../../index');
const snekfetch = require('snekfetch');

const key = Constants.getConfig.tokens.google;

/* eslint-disable class-methods-use-this */
module.exports = class Googl extends Command {

    constructor(...args) {
        super(...args, 'googl', {
            aliases: ['shortenurl', 'googleshorturl', 'shorten'],
            botPerms: ['EMBED_LINKS'],
            mode: 2,

            usage: '<URL:url>',
            description: 'Short your links with this tool.',
            extendedHelp: Command.strip`
                Shorten your urls with Googl!

                = Usage =
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

    async run(msg, [url]) {
        const embed = new Embed().setColor(msg.color).setTimestamp();
        if (/^https:\/\/goo\.gl\/.+/.test(url)) embed.setDescription(await this.short(url));
        else embed.setDescription(await this.long(url));
        return msg.send({ embed });
    }

    async long(url) {
        const { id } = await snekfetch.post(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`).send({ longUrl: url });
        return `**Shortened URL: [${id}](${id})**`;
    }

    async short(url) {
        const { longUrl } = await snekfetch.get(`https://www.googleapis.com/urlshortener/v1/url?key=${key}&shortUrl=${url}`).then(d => JSON.parse(d.text));
        return `**Expanded URL: [${longUrl}](${longUrl})**`;
    }

};
