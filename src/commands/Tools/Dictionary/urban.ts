import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Language, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { cutText, fetch, getColor } from '../../../lib/util/util';

const ZWS = '\u200B';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ud', 'urbandictionary'],
			cooldown: 15,
			description: language => language.tget('COMMAND_URBAN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_URBAN_EXTENDED'),
			nsfw: true,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<query:string> [page:integer{0,10}]',
			usageDelim: '#'
		});
	}

	public async run(message: KlasaMessage, [query, ind = 1]: [string, number]) {
		const index = ind - 1;
		if (index < 0) {
			throw message.language.tget('RESOLVER_POSITIVE_AMOUNT');
		}

		const { list } = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`, 'json') as UrbanDictionaryResultOk;

		const result = list[index];
		if (typeof result === 'undefined') {
			throw index === 0
				? message.language.tget('COMMAND_URBAN_NOTFOUND')
				: message.language.tget('COMMAND_URBAN_INDEX_NOTFOUND');
		}

		const definition = this.content(result.definition, result.permalink, message.language);
		return message.sendEmbed(new MessageEmbed()
			.setTitle(`Word: ${util.toTitleCase(query)}`)
			.setURL(result.permalink)
			.setColor(getColor(message) || 0xFFAB2D)
			.setThumbnail('https://i.imgur.com/CcIZZsa.png')
			.splitFields(message.language.tget('COMMAND_URBAN_OUTPUT', ind, list.length, definition, result.example, result.author))
			.addField(ZWS, `\\👍 ${result.thumbs_up}`, true)
			.addField(ZWS, `\\👎 ${result.thumbs_down}`, true)
			.setFooter('© Urban Dictionary'));
	}

	public content(definition: string, permalink: string, i18n: Language) {
		if (definition.length < 750) return definition;
		return i18n.tget('SYSTEM_TEXT_TRUNCATED', cutText(definition, 750), permalink);
	}

}

export interface UrbanDictionaryResultOk {
	list: UrbanDictionaryResultOkEntry[];
}

export interface UrbanDictionaryResultOkEntry {
	definition: string;
	permalink: string;
	thumbs_up: number;
	sound_urls: unknown[];
	author: string;
	word: string;
	defid: number;
	current_vote: string;
	written_on: Date;
	example: string;
	thumbs_down: number;
}
