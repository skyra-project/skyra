import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { cutText, toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['ud', 'urbandictionary'],
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Tools.UrbanDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.UrbanExtended),
	nsfw: true,
	usage: '<query:string>'
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [query]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const result = await fetch<UrbanDictionaryResultOk>(
			`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`,
			FetchResultTypes.JSON
		);
		const list = result.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

		const display = await this.buildDisplay(list, message, language, query);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(results: UrbanDictionaryResultOkEntry[], message: GuildMessage, language: Language, query: string) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(`Urban Dictionary: ${toTitleCase(query)}`)
				.setColor(await DbSet.fetchColor(message))
				.setThumbnail('https://i.imgur.com/CcIZZsa.png')
		).setFooterSuffix(' - © Urban Dictionary');

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
