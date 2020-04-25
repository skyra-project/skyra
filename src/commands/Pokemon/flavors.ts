import { DexDetails } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, POKEMON_EMBED_THUMBNAIL, resolveColour } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: language => language.tget('COMMAND_FLAVORS_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_FLAVORS_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class Flavors extends SkyraCommand {

	public async run(message: KlasaMessage, [pokemon]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const pokemonData = await this.fetchAPI(message, pokemon.toLowerCase());

		await this.buildDisplay(message, pokemonData).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_FLAVORS_QUERY_FAIL', pokemon);
		}
	}

	private buildDisplay(message: KlasaMessage, pokemonData: DexDetails) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, POKEMON_EMBED_THUMBNAIL)
				.setThumbnail(message.flagArgs.shiny ? pokemonData.shinySprite : pokemonData.sprite)
		);

		for (const flavorText of pokemonData.flavorTexts) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription([
					`**${flavorText.game}**`,
					flavorText.flavor
				].join('\n')));
		}

		return display;
	}

}
