import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchGraphQLPokemon, getFuzzyFlavorTexts, GetPokemonSpriteParameters, getSpriteKey, resolveColour } from '#utils/APIs/Pokemon';
import { CdnUrls } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import type { Pokemon } from '@favware/graphql-pokemon';
import { zalgo } from '@favware/zalgo';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['flavor', 'flavour', 'flavours'],
	description: LanguageKeys.Commands.Pokemon.FlavorsDescription,
	detailedDescription: LanguageKeys.Commands.Pokemon.FlavorsExtended,
	flags: ['shiny', 'back']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: Message, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const pokemon = (await args.rest('string')).toLowerCase();
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const pokemonData = await this.fetchAPI(pokemon, { backSprite, shinySprite });

		if (!pokemonData.flavorTexts.length) {
			this.error(LanguageKeys.Commands.Pokemon.FlavorNoFlavors, { pokemon: toTitleCase(pokemonData.species) });
		}

		await this.buildDisplay(t, pokemonData, { backSprite, shinySprite }).run(response, message.author);
		return response;
	}

	private async fetchAPI(pokemon: string, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const {
				data: { getFuzzyPokemon: result }
			} = await fetchGraphQLPokemon<'getFuzzyPokemon'>(getFuzzyFlavorTexts(getSpriteParams), {
				pokemon
			});

			if (!result.length) {
				this.error(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
			}

			return result[0];
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
		}
	}

	private buildDisplay(t: TFunction, pokemonData: Pokemon, getSpriteParams: GetPokemonSpriteParameters) {
		const spriteToGet = getSpriteKey(getSpriteParams);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor({ name: `#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, iconURL: CdnUrls.Pokedex })
				.setThumbnail(pokemonData[spriteToGet])
		}).setSelectMenuOptions((pageIndex) => ({ label: pokemonData.flavorTexts[pageIndex - 1].game }));

		for (const { game, flavor } of pokemonData.flavorTexts) {
			display //
				.addPageEmbed((embed) =>
					embed //
						.setDescription(
							`${t(LanguageKeys.Commands.Pokemon.DragoniteReminder)}\n\n${[
								`**${game}**`,
								pokemonData.num === 0 ? zalgo(flavor) : flavor
							].join('\n')}`
						)
				);
		}

		return display;
	}
}
