import { toTitleCase } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { TOKENS } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Mime } from '@utils/constants';
import { cutText, fetch, FetchResultTypes, IMAGE_EXTENSION, parseURL } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

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
		const template = new MessageEmbed()
			.setTitle(toTitleCase(results.word))
			.setColor(await DbSet.fetchColor(message));

		if (results.pronunciation) template.addField(message.language.get('COMMAND_DEFINE_PRONOUNCIATION'), results.pronunciation, true);

		const display = new UserRichDisplay(template)
			.setFooterSuffix(' - Powered by Owlbot');

		for (const result of results.definitions) {
			const definition = this.content(result.definition);
			display.addPage((embed: MessageEmbed) => {
				embed
					.addField('Type', result.type ? toTitleCase(result.type) : message.language.tget('COMMAND_DEFINE_UNKNOWN'), true)
					.setDescription(definition);

				const imageUrl = IMAGE_EXTENSION.test(result.image_url ?? '') && parseURL(result.image_url ?? '');
				if (imageUrl) embed.setThumbnail(imageUrl.toString());

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
	pronunciation: string | null;
}

export interface OwlbotDefinition {
	type: string | null;
	definition: string;
	example: string | null;
	image_url: string | null;
	emoji: string | null;
}
