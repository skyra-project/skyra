const { structures: { Command } } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekie = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['duckduckgo'],
			mode: 2,
			cooldown: 15,

			usage: '<query:string>',
			usageDelim: ' ',
			description: 'Search things from the Internet with DuckDuckGo.'
		});
	}

	async run(msg, [query], settings, i18n) {
		const body = await snekie
			.get(`http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`)
			.then(result => JSON.parse(result.text));

		if (body.Heading.length === 0)
			throw i18n.get('COMMAND_DUCKDUCKGO_NOTFOUND');

		const embed = new MessageEmbed()
			.setAuthor(body.Heading, this.client.user.displayAvatarURL({ size: 64 }))
			.setURL(body.AbstractURL)
			.setThumbnail(body.Image)
			.setDescription(body.AbstractText);

		if (body.RelatedTopics && body.RelatedTopics.length > 0)
			embed.addField(i18n.get('COMMAND_DUCKDUCKGO_LOOKALSO'), body.RelatedTopics[0].Text);

		msg.send({ embed });
	}

};
