import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchGraphQLPokemon, getPokemonSprite } from '#utils/APIs/Pokemon';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokesprite', 'pokeimage'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.SpriteDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.SpriteExtended,
	requiredGuildPermissions: ['EMBED_LINKS'],
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: Message, [pokemon]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);
		const pokeDetails = await this.fetchAPI(pokemon.toLowerCase(), t);

		return response.edit(Reflect.has(message.flagArgs, 'shiny') ? pokeDetails.shinySprite : pokeDetails.sprite, { embed: null });
	}

	private async fetchAPI(pokemon: string, t: TFunction) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonSprite, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.PokedexQueryFail, { pokemon });
		}
	}
}
