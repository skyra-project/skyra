import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { cutText, toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['ud', 'urbandictionary'],
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Tools.UrbanDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.UrbanExtended),
	nsfw: true,
	runIn: ['text'],
	usage: '<query:string>'
})
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [query]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(await message.fetchLocale(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const result = await fetch<UrbanDictionaryResultOk>(
			`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`,
			FetchResultTypes.JSON
		);
		const list = result.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

		const display = await this.buildDisplay(list, message, query);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(results: UrbanDictionaryResultOkEntry[], message: KlasaMessage, query: string) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(`Urban Dictionary: ${toTitleCase(query)}`)
				.setColor(await DbSet.fetchColor(message))
				.setThumbnail('https://i.imgur.com/CcIZZsa.png')
		).setFooterSuffix(' - © Urban Dictionary');

		const language = await message.fetchLanguage();

		for (const result of results) {
			const definition = this.parseDefinition(result.definition, result.permalink, language);
			const example = result.example ? this.parseDefinition(result.example, result.permalink, language) : 'None';
			display.addPage((embed: MessageEmbed) =>
				embed
					.setURL(result.permalink)
					.setDescription(definition)
					.addField('Example', example)
					.addField('Author', result.author || 'UrbanDictionary User')
					.addField('👍', `${result.thumbs_up}`, true)
					.addField('👎', `${result.thumbs_down}`, true)
			);
		}

		return display;
	}

	private parseDefinition(definition: string, permalink: string, i18n: Language) {
		if (definition.length < 750) return definition;
		return i18n.get(LanguageKeys.Misc.SystemTextTruncated, { definition: cutText(definition, 750), url: permalink });
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
