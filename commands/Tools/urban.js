const { structures: { Command }, util: { util } } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekie = require('snekfetch');
const ZWS = '\u200B';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['urbandictionary'],
			botPerms: ['EMBED_LINKS'],
			mode: 1,
			cooldown: 15,

			usage: '<query:string> [index:integer{0,10}]',
			usageDelim: ' #',
			description: 'Check the definition of a word on UrbanDictionary.',
			extendedHelp: Command.strip`
                What does "spam" mean?

                ⚙ | ***Explained usage***
                Skyra, urban [word] #[index]
                Word :: The word or phrase you want to get the definition from.
                Index :: Defaults to 1, the page you wish to read.

                🔗 | ***Examples***
                • Skyra, urban spam
                    spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam
            `
		});
	}

	async run(msg, [query, ind = 1], settings, i18n) {
		const index = ind - 1;
		if (index < 0)
			throw i18n.get('RESOLVER_POSITIVE_AMOUNT');

		const { list } = await snekie.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`)
			.then(data => JSON.parse(data.text));

		const result = list[index];
		if (typeof result === 'undefined')
			throw index === 0
				? i18n.get('COMMAND_URBAN_NOTFOUND')
				: i18n.get('COMMAND_URBAN_INDEX_NOTFOUND');

		const definition = this.content(result.definition, result.permalink, i18n);
		const embed = new MessageEmbed()
			.setTitle(`Word: ${util.toTitleCase(query)}`)
			.setURL(result.permalink)
			.setColor(msg.color)
			.setThumbnail('http://i.imgur.com/CcIZZsa.png')
			.setDescription(i18n.get('COMMAND_URBAN_DESCRIPTION', ind, list.length, definition, result.example, result.author))
			.addField(ZWS, `\\👍 ${result.thumbs_up}`, true)
			.addField(ZWS, `\\👎 ${result.thumbs_down}`, true)
			.setFooter('© Urban Dictionary');

		return msg.send({ embed });
	}

	content(definition, permalink, i18n) {
		if (definition.length < 750) return definition;
		return i18n.get('SYSTEM_TEXT_TRUNCATED', util.splitText(definition, 750), permalink);
	}

};
