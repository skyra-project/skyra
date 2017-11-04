const { Command, util } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

const baseURL = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&indexpageids=1&redirects=1&explaintext=1&exsectionformat=plain&titles=';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['wiki'],
			botPerms: ['EMBED_LINKS'],
			mode: 1,
			cooldown: 15,

			usage: '<query:string>',
			description: 'Search something throught Wikipedia.'
		});
	}

	async run(msg, [input], settings, i18n) {
		input = this.parseURL(input);
		const text = await snekfetch.get(baseURL + input)
			.then(data => JSON.parse(data.text))
			.catch(Command.handleError);

		if (text.query.pageids[0] === '-1')
			throw i18n.get('COMMAND_WIKIPEDIA_NOTFOUND');

		const url = `https://en.wikipedia.org/wiki/${input}`;
		const content = text.query.pages[text.query.pageids[0]];
		const definition = this.content(content.extract, url, i18n);

		const embed = new MessageEmbed()
			.setTitle(content.title)
			.setURL(url)
			.setColor(0x05C9E8)
			.setThumbnail('https://en.wikipedia.org/static/images/project-logos/enwiki.png')
			.setDescription(definition
				.replace(/\n{2,}/g, '\n')
				.replace(/\s{2,}/g, ' '))
			.setFooter('© Wikipedia');

		return msg.send({ embed });
	}

	parseURL(url) {
		return encodeURIComponent(
			url
				.toLowerCase()
				.replace(/[ ]/g, '_')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29'),
		);
	}

	content(definition, url, i18n) {
		if (definition.length < 750) return definition;
		return i18n.get('SYSTEM_TEXT_TRUNCATED', util.splitText(definition, 750), url);
	}

};
