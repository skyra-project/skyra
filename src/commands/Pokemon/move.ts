import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getMoveDetailsByFuzzy, GraphQLPokemonResponse, POKEMON_GRAPHQL_API_URL, POKEMON_EMBED_THUMBNAIL, parseBulbapediaURL } from '../../lib/util/Pokemon';
import { fetch, FetchResultTypes, getColor } from '../../lib/util/util';
import { MessageEmbed } from 'discord.js';
import { toTitleCase } from '@klasa/utils';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_MOVE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MOVE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<move:str>'
		});
	}

	public async run(message: KlasaMessage, [move]: [string]) {
		try {
			const { getMoveDetailsByFuzzy: moveDetails } = (await this.fetchAPI(message, move.toLowerCase())).data;

			const embedTranslations = message.language.tget('COMMAND_MOVE_EMBED_DATA');
			return message.sendEmbed(new MessageEmbed()
				.setColor(getColor(message))
				.setAuthor(`${embedTranslations.MOVE} - ${toTitleCase(moveDetails.name)}`, POKEMON_EMBED_THUMBNAIL)
				.setDescription(moveDetails.desc || moveDetails.shortDesc)
				.addField(embedTranslations.TYPE, moveDetails.type, true)
				.addField(embedTranslations.BASE_POWER, moveDetails.basePower, true)
				.addField(embedTranslations.PP, moveDetails.pp, true)
				.addField(embedTranslations.CATEGORY, moveDetails.category, true)
				.addField(embedTranslations.ACCURACY, `${moveDetails.accuracy}%`, true)
				.addField(embedTranslations.PRIORITY, moveDetails.priority, true)
				.addField(embedTranslations.TARGET, moveDetails.target, true)
				.addField(embedTranslations.CONTEST_CONDITION, moveDetails.contestType ?? embedTranslations.NONE, true)
				.addField(embedTranslations.Z_CRYSTAL, moveDetails.isZ ?? embedTranslations.NONE, true)
				.addField(embedTranslations.GMAX_POKEMON, moveDetails.isGMax ?? embedTranslations.NONE)
				.addField(embedTranslations.AVAILABLE_IN_GENERATION_8_TITLE, embedTranslations.AVAILABLE_IN_GENERATION_8_DATA(moveDetails.isNonstandard !== 'Past'))
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(moveDetails.bulbapediaPage)} )`,
					`[Serebii](${moveDetails.serebiiPage})`,
					`[Smogon](${moveDetails.smogonPage})`
				].join(' | ')));
		} catch (err) {
			throw message.language.tget('COMMAND_MOVE_QUERY_FAIL', move);
		}
	}

	private async fetchAPI(message: KlasaMessage, move: string) {
		return fetch(POKEMON_GRAPHQL_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: getMoveDetailsByFuzzy(move)
			})
		}, FetchResultTypes.JSON)
			.catch(() => {
				throw message.language.tget('SYSTEM_QUERY_FAIL');
			}) as Promise<GraphQLPokemonResponse<'getMoveDetailsByFuzzy'>>;
	}

}
