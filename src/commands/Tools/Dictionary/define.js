const { Command, config: { tokens: { oxford: { API_ID, API_KEY } } }, util: { fetch } } = require('../../../index');

const options = { headers: { Accept: 'application/json', app_id: API_ID, app_key: API_KEY } }; // eslint-disable-line camelcase
const URL = 'https://od-api.oxforddictionaries.com/api/v1/entries/en/';
const TABLENAME = 'oxford';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 20,
			bucket: 2,
			description: msg => msg.language.get('COMMAND_DEFINE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_DEFINE_EXTENDED'),
			usage: '<input:string>'
		});
	}

	get r() {
		return this.client.providers.default.db;
	}

	async run(msg, [input]) {
		const lexicalEntries = await this.fetch(msg, encodeURIComponent(input.toLowerCase()));

		const output = [];
		for (const entry of lexicalEntries) this.resolveEntry(output, entry);
		output.push('*Powered by Oxford Dictionaries*');

		return msg.sendMessage(output.join('\n\n'));
	}

	resolveEntry(output, { pronounciations, lexicalCategory, text, entries }) {
		output.push([
			`\`${output.length + 1}\` [\`${lexicalCategory}\`] **${text}** ${this.resolvePronounciations(pronounciations)}`,
			this.format(entries)
		].join('\n'));
	}

	resolvePronounciations(pronounciations) {
		if (!pronounciations.length) return '';
		return pronounciations.map(pronounciation => `\`/${pronounciation.spelling}/\` (${pronounciation.notation})`).join(' ');
	}

	format(entries) {
		const output = [];

		let i = 0;
		for (const entry of entries) {
			const isLast = i === entries.length - 1;
			const line = isLast ? '└─' : '├─';
			const nextLine = isLast ? '\u200B  ' : '│ ';
			const { length } = entry;

			let y = 0;
			for (const subentry of entry) {
				const isNestedLast = y === length - 1;
				output.push(`\`${y !== 0 ? nextLine : line}${y === 0 && length > 1 ? '┬' : length === 1 ? '─' : isNestedLast ? '└' : '├'}\` ${subentry}`);
				y++;
			}

			i++;
		}

		return output.join('\n');
	}

	async fetch(msg, query) {
		const data = await this.r.table(TABLENAME).get(query);
		if (data) {
			if (!data.valid) throw msg.language.get('COMMAND_DEFINE_NOTFOUND');
			return data.lexicalEntries;
		}

		try {
			const fetched = await fetch(URL + query, options, 'json');
			const lexicalEntries = fetched.results[0].lexicalEntries.slice(0, 5).map(this._resolveData);
			await this.r.table(TABLENAME).insert({ id: query, valid: true, lexicalEntries });
			return lexicalEntries;
		} catch (error) {
			await this.r.table(TABLENAME).insert({ id: query, valid: false });
			throw msg.language.get('COMMAND_DEFINE_NOTFOUND');
		}
	}

	_resolveData({ pronunciations, lexicalCategory, text, entries }) {
		return {
			entries: entries.map(entry => entry.senses.map(sense => sense.definitions.join('\n'))),
			lexicalCategory,
			pronounciations: pronunciations.map(pronounciation => ({ spelling: pronounciation.phoneticSpelling, notation: pronounciation.phoneticNotation })),
			text
		};
	}

	async init() {
		const { r } = this;
		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
	}

};
