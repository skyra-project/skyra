const { Command, config: { tokens: { google: KEY } }, MessageEmbed, util: { fetch } } = require('../../index');

const REG_GOOGL = /^https:\/\/goo\.gl\/.+/;
const LONG_URL = new URL('https://www.googleapis.com/urlshortener/v1/url');
LONG_URL.searchParams.set('key', KEY);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['shortenurl', 'googleshorturl', 'shorten'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 15,
			description: msg => msg.language.get('COMMAND_GOOGL_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_GOOGL_EXTENDED'),
			usage: '<URL:url>'
		});
	}

	async run(msg, [url]) {
		const embed = new MessageEmbed()
			.setDescription(await (REG_GOOGL.test(url) ? this.short(url, msg.language) : this.long(url, msg.language)))
			.setTimestamp();
		return msg.sendMessage({ embed });
	}

	async long(longUrl, i18n) {
		const body = await fetch(LONG_URL, { method: 'POST', body: { longUrl: longUrl } }, 'json');
		return i18n.get('COMMAND_GOOGL_LONG', body.id);
	}

	async short(shortUrl, i18n) {
		const url = new URL('https://www.googleapis.com/urlshortener/v1/url');
		url.search = new URLSearchParams([['key', KEY], ['shortUrl', shortUrl]]);

		const body = await fetch(url, 'json');
		return i18n.get('COMMAND_GOOGL_SHORT', body.longUrl);
	}

};
