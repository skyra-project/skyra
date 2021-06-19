import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchGraphQLPokemon, getPokemonSprite, GetPokemonSpriteParameters, getSpriteKey } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokesprite', 'pokeimage'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.SpriteDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.SpriteExtended,
	permissions: ['EMBED_LINKS'],
	strategyOptions: { flags: ['shiny', 'back'] }
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const pokemon = (await args.rest('string')).toLowerCase();
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const pokeDetails = await this.fetchAPI(pokemon.toLowerCase(), { backSprite, shinySprite });
		const spriteToGet = getSpriteKey({ backSprite, shinySprite });

		return response.edit(pokeDetails[spriteToGet], { embed: null });
	}

	private async fetchAPI(pokemon: string, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonSprite(getSpriteParams), { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.PokedexQueryFail, { pokemon });
		}
	}
}
