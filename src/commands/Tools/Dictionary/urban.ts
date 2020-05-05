import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { BrandingColors } from '@utils/constants';
import { cutText, fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Language, util } from 'klasa';

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
			usage: '<query:string>'
		});
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const result = await fetch<UrbanDictionaryResultOk>(
			`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`,
			FetchResultTypes.JSON
		);
		const list = result.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

		const display = this.buildDisplay(list, message, query);

		await display.start(response, message.author.id);
		return response;
	}

	public content(definition: string, permalink: string, i18n: Language) {
		if (definition.length < 750) return definition;
		return i18n.tget('SYSTEM_TEXT_TRUNCATED', cutText(definition, 750), permalink);
	}

	private buildDisplay(results: UrbanDictionaryResultOkEntry[], message: KlasaMessage, query: string) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setTitle(`Urban Dictionary: ${util.toTitleCase(query)}`)
			.setColor(getColor(message))
			.setThumbnail('https://i.imgur.com/CcIZZsa.png'))
			.setFooterSuffix(' - © Urban Dictionary');

		for (const result of results) {
			const definition = this.content(result.definition, result.permalink, message.language);
			const example = result.example ? this.content(result.example, result.permalink, message.language) : 'None';
			display.addPage((embed: MessageEmbed) => embed
				.setURL(result.permalink)
				.setDescription(definition)
				.addField('Example', example)
				.addField('Author', result.author)
				.addField(ZWS, `\\👍 ${result.thumbs_up}`, true)
				.addField(ZWS, `\\👎 ${result.thumbs_down}`, true));
		}

		return display;
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
