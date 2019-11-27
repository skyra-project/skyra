import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getPokemonFlavorTextsByFuzzy, GraphQLPokemonResponse, POKEMON_EMBED_THUMBNAIL, POKEMON_GRAPHQL_API_URL, resolveColour } from '../../lib/util/Pokemon';
import { fetch, FetchResultTypes } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['flavor', 'flavour', 'flavours'],
			cooldown: 10,
			description: language => language.tget('COMMAND_FLAVORS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FLAVORS_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<pokemon:str>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [pokemon]: [string]) {
		try {
			const { getPokemonDetailsByFuzzy: poke } = (await this.fetchAPI(message, pokemon.toLowerCase())).data;

			const embed = new MessageEmbed()
				.setColor(resolveColour(poke.color))
				.setAuthor(`#${poke.num} - ${toTitleCase(poke.species)}`, POKEMON_EMBED_THUMBNAIL)
				.setThumbnail(message.flagArgs.shiny ? poke.shinySprite : poke.sprite);

			let totalEntriesLength = 0;

			for (const entry of poke.flavorTexts) {
				if (totalEntriesLength >= 6000) break;

				embed.addField(entry.game, entry.flavor, true);
				totalEntriesLength += entry.game.length + entry.flavor.length;
			}

			return message.sendEmbed(embed);
		} catch (err) {
			throw message.language.tget('COMMAND_FLAVORS_QUERY_FAIL', pokemon);
		}
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			return await fetch(POKEMON_GRAPHQL_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: getPokemonFlavorTextsByFuzzy(pokemon)
				})
			}, FetchResultTypes.JSON) as Promise<GraphQLPokemonResponse<'getPokemonDetailsByFuzzy'>>;
		} catch (err) {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

}
