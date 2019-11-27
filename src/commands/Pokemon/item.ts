import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getItemDetailsByFuzzy, GraphQLPokemonResponse, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL, POKEMON_GRAPHQL_API_URL } from '../../lib/util/Pokemon';
import { fetch, FetchResultTypes, getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pokeitem', 'bag'],
			cooldown: 10,
			description: language => language.tget('COMMAND_ITEM_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ITEM_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<item:str>'
		});
	}

	public async run(message: KlasaMessage, [item]: [string]) {
		try {
			const { getItemDetailsByFuzzy: itemDetails } = (await this.fetchAPI(message, item.toLowerCase())).data;

			const embedTranslations = message.language.tget('COMMAND_ITEM_EMEBED_DATA');
			return message.sendEmbed(new MessageEmbed()
				.setColor(getColor(message))
				.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, POKEMON_EMBED_THUMBNAIL)
				.setThumbnail((itemDetails as any).sprite)
				.addField(embedTranslations.DESCRIPTION, itemDetails.desc)
				.addField(embedTranslations.GENERATION_INTRODUCED, (itemDetails as any).generationIntroduced, true)
				.addField(embedTranslations.AVAILABLE_IN_GENERATION_8_TITLE, embedTranslations.AVAILABLE_IN_GENERATION_8_DATA((itemDetails as any).isNonstandard !== 'Past'), true)
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(itemDetails.bulbapediaPage)} )`,
					`[Serebii](${itemDetails.serebiiPage})`,
					`[Smogon](${itemDetails.smogonPage})`
				].join(' | ')));
		} catch (err) {
			throw message.language.tget('COMMAND_ITEM_QUERY_FAIL', item);
		}
	}

	private async fetchAPI(message: KlasaMessage, item: string) {
		try {
			return await fetch(POKEMON_GRAPHQL_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: getItemDetailsByFuzzy(item)
				})
			}, FetchResultTypes.JSON) as Promise<GraphQLPokemonResponse<'getItemDetailsByFuzzy'>>;
		} catch (err) {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

}
