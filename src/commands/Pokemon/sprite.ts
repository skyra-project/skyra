import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchGraphQLPokemon, getPokemonSprite, GetPokemonSpriteParameters, getSpriteKey } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokesprite', 'pokeimage'],
	description: LanguageKeys.Commands.Pokemon.SpriteDescription,
	detailedDescription: LanguageKeys.Commands.Pokemon.SpriteExtended,
	flags: ['shiny', 'back'],
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
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

		const content = pokeDetails[spriteToGet];
		return response.edit({ content, embeds: [] });
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
