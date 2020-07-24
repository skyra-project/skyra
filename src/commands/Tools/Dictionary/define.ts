import { KlasaMessage } from 'klasa';
import { TOKENS } from '@root/config';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { cutText, fetch, FetchResultTypes } from '@utils/util';
import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Mime } from '@utils/constants';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['definition', 'defination', 'dictionary'],
	bucket: 2,
	cooldown: 20,
	description: language => language.get('COMMAND_DEFINE_DESCRIPTION'),
	extendedHelp: language => language.get('COMMAND_DEFINE_EXTENDED'),
	usage: '<input:string>'
})
export default class extends RichDisplayCommand {

	public async run(message: KlasaMessage, [input]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const result = await this.fetchApi(message, input);
		const display = await this.buildDisplay(result, message);

		await display.start(response, message.author.id);
		return response;

	}

	private async buildDisplay(results: OwlbotResultOk, message: KlasaMessage) {
		const base = new MessageEmbed()
			.setTitle(toTitleCase(results.word))
			.setColor(await DbSet.fetchColor(message));

		if (results.pronunciation) base.addField(message.language.get('COMMAND_DEFINE_PRONOUNCIATION'), results.pronunciation, true);

		const display = new UserRichDisplay(base)
			.setFooterSuffix(' - Powered by Owlbot');

		for (const result of results.definitions) {
			const definition = this.content(result.definition);
			display.addPage((embed: MessageEmbed) => {
				embed
					.addField('Type', toTitleCase(result.type), true)
					.setDescription(`${definition[0].toUpperCase()}${definition.substr(1)}`);
				if (result.image_url) embed.setThumbnail(result.image_url);
				return embed;
			});
		}

		return display;
	}

	private async fetchApi(message: KlasaMessage, word: string) {
		try {
			return await fetch<OwlbotResultOk>(
				`https://owlbot.info/api/v4/dictionary/${encodeURIComponent(word.toLowerCase())}`,
				{ headers: { Accept: Mime.Types.ApplicationJson, Authorization: `Token ${TOKENS.OWLBOT}` } },
				FetchResultTypes.JSON
			);
		} catch {
			throw message.language.get('COMMAND_DEFINE_NOTFOUND');
		}
	}

	private content(definition: string) {
		if (definition.length < 2048) return definition;
		return cutText(definition, 2048);
	}

}

export interface OwlbotResultOk {
	definitions: readonly OwlbotDefinition[];
	word: string;
	pronunciation: string|null;
}

export interface OwlbotDefinition {
	type: string;
	definition: string;
	example: string|null;
	image_url: string|null;
	emoji: string|null;
}
