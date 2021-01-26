import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchGraphQLPokemon, getPokemonSprite } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokesprite', 'pokeimage'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.SpriteDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.SpriteExtended,
	permissions: ['EMBED_LINKS'],
	strategyOptions: { flags: ['shiny'] }
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const pokemon = (await args.rest('string')).toLowerCase();
		const { t } = args;
		const response = await sendLoadingMessage(message, t);
		const pokeDetails = await this.fetchAPI(pokemon.toLowerCase(), t);

		return response.edit(args.getFlags('shiny') ? pokeDetails.shinySprite : pokeDetails.sprite, { embed: null });
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
