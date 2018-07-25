const { Command, MessageEmbed, klasaUtil: { toTitleCase }, util: { fetch, cutText } } = require('../../../index');
const ZWS = '\u200B';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ud', 'urbandictionary'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 15,
			description: msg => msg.language.get('COMMAND_URBAN_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_URBAN_EXTENDED'),
			usage: '<query:string> [page:integer{0,10}]',
			usageDelim: '#',
			nsfw: true
		});
	}

	async run(msg, [query, ind = 1]) {
		const index = ind - 1;
		if (index < 0)
			throw msg.language.get('RESOLVER_POSITIVE_AMOUNT');

		const { list } = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`, 'json');

		const result = list[index];
		if (typeof result === 'undefined') {
			throw index === 0
				? msg.language.get('COMMAND_URBAN_NOTFOUND')
				: msg.language.get('COMMAND_URBAN_INDEX_NOTFOUND');
		}

		const definition = this.content(result.definition, result.permalink, msg.language);
		return msg.sendEmbed(new MessageEmbed()
			.setTitle(`Word: ${toTitleCase(query)}`)
			.setURL(result.permalink)
			.setColor(msg.color)
			.setThumbnail('http://i.imgur.com/CcIZZsa.png')
			.splitFields(msg.language.get('COMMAND_URBAN_OUTPUT', ind, list.length, definition, result.example, result.author))
			.addField(ZWS, `\\👍 ${result.thumbs_up}`, true)
			.addField(ZWS, `\\👎 ${result.thumbs_down}`, true)
			.setFooter('© Urban Dictionary'));
	}

	content(definition, permalink, i18n) {
		if (definition.length < 750) return definition;
		return i18n.get('SYSTEM_TEXT_TRUNCATED', cutText(definition, 750), permalink);
	}

};
