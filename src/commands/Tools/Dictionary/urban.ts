import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { fetch, FetchResultTypes, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText, toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['ud', 'urbandictionary'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.UrbanDescription,
	extendedHelp: LanguageKeys.Commands.Tools.UrbanExtended,
	nsfw: true
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const query = await args.rest('string');
		const response = await sendLoadingMessage(message, args.t);

		const result = await fetch<UrbanDictionaryResultOk>(
			`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`,
			FetchResultTypes.JSON
		);
		if (result.list.length === 0) this.error(LanguageKeys.Commands.Tools.UrbanNoDefinition, { parameter: query });
		const list = result.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

		const display = await this.buildDisplay(list, message, args.t, query);

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildDisplay(results: UrbanDictionaryResultOkEntry[], message: GuildMessage, language: TFunction, query: string) {
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setTitle(`Urban Dictionary: ${toTitleCase(query)}`)
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail('https://i.imgur.com/CcIZZsa.png')
				.setFooter('© Urban Dictionary')
		});

		for (const result of results) {
			const definition = this.parseDefinition(result.definition, result.permalink, language);
			const example = result.example ? this.parseDefinition(result.example, result.permalink, language) : 'None';
			display.addPageEmbed((embed: MessageEmbed) =>
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

	private parseDefinition(definition: string, permalink: string, i18n: TFunction) {
		if (definition.length < 750) return definition;
		return i18n(LanguageKeys.Misc.SystemTextTruncated, { definition: cutText(definition, 750), url: permalink });
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
