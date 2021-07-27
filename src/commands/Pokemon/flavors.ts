import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, GetPokemonSpriteParameters, getSpriteKey, resolveColour } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import type { DexDetails } from '@favware/graphql-pokemon';
import { zalgo } from '@favware/zalgo';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.FlavorsDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.FlavorsExtended,
	strategyOptions: { flags: ['shiny', 'back'] }
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const pokemon = (await args.rest('string')).toLowerCase();
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const pokemonData = await this.fetchAPI(pokemon, { backSprite, shinySprite });

		if (!pokemonData.flavorTexts.length) {
			this.error(LanguageKeys.Commands.Pokemon.FlavorNoFlavors, { pokemon: toTitleCase(pokemonData.species) });
		}

		await this.buildDisplay(pokemonData, { backSprite, shinySprite }).run(response, message.author);
		return response;
	}

	private async fetchAPI(pokemon: string, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy(getSpriteParams), {
				pokemon
			});
			return data.getPokemonDetailsByFuzzy;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
		}
	}

	private buildDisplay(pokemonData: DexDetails, getSpriteParams: GetPokemonSpriteParameters) {
		const spriteToGet = getSpriteKey(getSpriteParams);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, CdnUrls.Pokedex)
				.setThumbnail(pokemonData[spriteToGet])
		});

		for (const { game, flavor } of pokemonData.flavorTexts) {
			display.addPageEmbed((embed) => embed.setDescription([`**${game}**`, pokemonData.num === 0 ? zalgo(flavor) : flavor].join('\n')));
		}

		return display;
	}
}
