import { toTitleCase } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
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
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [pokemon]: [string]) {
		const poke = await this.fetchAPI(message, pokemon.toLowerCase());

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
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_FLAVORS_QUERY_FAIL', pokemon);
		}
	}

}
