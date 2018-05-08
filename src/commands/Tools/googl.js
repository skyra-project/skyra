const { Command, config: { tokens: { google: KEY } }, MessageEmbed } = require('../../index');
const { post, get } = require('snekfetch');

const REG_GOOGL = /^https:\/\/goo\.gl\/.+/;

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

	async long(url, i18n) {
		const { body } = await post(`https://www.googleapis.com/urlshortener/v1/url?key=${KEY}`).send({ longUrl: url });
		return i18n.get('COMMAND_GOOGL_LONG', body.id);
	}

	async short(url, i18n) {
		const { body } = await get(`https://www.googleapis.com/urlshortener/v1/url?key=${KEY}&shortUrl=${url}`);
		return i18n.get('COMMAND_GOOGL_SHORT', body.longUrl);
	}

};
