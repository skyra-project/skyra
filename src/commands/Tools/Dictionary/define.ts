import { KlasaMessage } from 'klasa';
import { TOKENS } from '@root/config';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { cutText, fetch, FetchResultTypes } from '@utils/util';
import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';

const options = { headers: { Accept: 'application/json', Authorization: `Token ${TOKENS.OWLBOT}` } };

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

		try {
			const result = await fetch<OwlbotResultOk>(
				`https://owlbot.info/api/v4/dictionary/${encodeURIComponent(input.toLowerCase())}`,
				options,
				FetchResultTypes.JSON
			);

			const display = await this.buildDisplay(result, message);
			await display.start(response, message.author.id);
			return response;
		} catch {
			throw message.language.get('COMMAND_DEFINE_NOTFOUND');
		}
	}

	private async buildDisplay(results: OwlbotResultOk, message: KlasaMessage) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setTitle(toTitleCase(results.word))
			.setColor(await DbSet.fetchColor(message))
			.addField('Pronounciation', results.pronunciation, true))
			.setFooterSuffix('- Powered by Owlbot');

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

	private content(definition: string) {
		if (definition.length < 2048) return definition;
		return cutText(definition, 2048);
	}

}

export interface OwlbotResultOk {
	definitions: Array<{
		type: string;
		definition: string;
		example: string|null;
		image_url: string|null;
		emoji: string|null;
	}>;
	word: string;
	pronunciation: string;
}
