import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { TOKENS } from '../../../../config';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { fetch } from '../../../lib/util/util';

const options = { headers: { Accept: 'application/json', app_id: TOKENS.OXFORD_API.API_ID, app_key: TOKENS.OXFORD_API.API_KEY } };
const URL = 'https://od-api.oxforddictionaries.com/api/v1/entries/en/';
const TABLENAME = 'oxford';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 20,
			description: (language) => language.get('COMMAND_DEFINE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DEFINE_EXTENDED'),
			usage: '<input:string>'
		});
	}

	public get r() {
		return this.client.providers.default.db;
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		const lexicalEntries = await this.fetch(message, encodeURIComponent(input.toLowerCase()));

		const output = [] as string[];
		for (const entry of lexicalEntries) this.resolveEntry(output, entry);
		output.push('*Powered by Oxford Dictionaries*');

		return message.sendMessage(output.join('\n\n'));
	}

	private resolveEntry(output: string[], { pronounciations, lexicalCategory, text, entries }: DefineLexicalEntry) {
		output.push([
			`\`${output.length + 1}\` [\`${lexicalCategory}\`] **${text}** ${this.resolvePronounciations(pronounciations)}`,
			this.format(entries)
		].join('\n'));
	}

	private resolvePronounciations(pronounciations: DefinePronounciation[]) {
		if (!pronounciations.length) return '';
		return pronounciations.map((pronounciation) => `\`/${pronounciation.spelling}/\` (${pronounciation.notation})`).join(' ');
	}

	private format(entries: any[]) {
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

	private async fetch(message: KlasaMessage, query: string): Promise<DefineLexicalEntries> {
		const data = await this.r.table(TABLENAME).get(query).run();
		if (data) {
			if (!data.valid) throw message.language.get('COMMAND_DEFINE_NOTFOUND');
			return data.lexicalEntries;
		}

		try {
			const fetched = await fetch(URL + query, options, 'json');
			const lexicalEntries = fetched.results[0].lexicalEntries.slice(0, 5).map(this._resolveData);
			await this.r.table(TABLENAME).insert({ id: query, valid: true, lexicalEntries }).run();
			return lexicalEntries;
		} catch (error) {
			await this.r.table(TABLENAME).insert({ id: query, valid: false }).run();
			throw message.language.get('COMMAND_DEFINE_NOTFOUND');
		}
	}

	private _resolveData({ pronunciations, lexicalCategory, text, entries }: any): DefineLexicalEntry {
		return {
			entries: entries.map((entry) => entry.senses.map((sense) => sense.definitions.join('\n'))),
			lexicalCategory,
			pronounciations: pronunciations.map((pronounciation) => ({ spelling: pronounciation.phoneticSpelling, notation: pronounciation.phoneticNotation })),
			text
		};
	}

}

interface DefinePronounciation {
	spelling: string;
	notation: string;
}

interface DefineLexicalEntry {
	entries: string[];
	lexicalCategory: string;
	pronounciations: DefinePronounciation[];
	text: string;
}

interface DefineLexicalEntries extends Array<DefineLexicalEntry> { }
