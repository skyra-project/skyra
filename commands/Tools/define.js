const { Command, util: { parseHTML } } = require('../../index');

const URL = 'https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=';
const REG_TAGS = /\[\/?i\]/, REG_LNS = /\n+/g, REG_TICKS = /`/g;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_DEFINE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_DEFINE_EXTENDED'),
			usage: '<input:string>'
		});
	}

	async run(msg, [input]) {
		const data = await this.fetchURL(URL + encodeURIComponent(input), 'json');
		if (!data.tuc || !data.tuc[0])
			throw msg.language.get('COMMAND_DEFINE_NOTFOUND');

		const entry = data.tuc.find(obj => obj.meanings);
		if (!entry) throw msg.language.get('COMMAND_DEFINE_NOTFOUND');

		const final = [];
		const limit = Math.min(5, entry.meanings.length);
		for (let i = 0; i < limit; i++) {
			final.push(`**\`${i + 1}\` ❯** ${this.cleanText(entry.meanings[i].text)}`);
		}

		return msg.sendMessage(msg.language.get('COMMAND_DEFINE', input, final.join('\n')));
	}

	cleanText(text) {
		return parseHTML(text.replace(REG_TAGS, '*').replace(REG_LNS, '\n\n').replace(REG_TICKS, '\\`'));
	}

};
