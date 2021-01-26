import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, resolveColour } from '#utils/APIs/Pokemon';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import type { DexDetails } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.FlavorsDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.FlavorsExtended,
	strategyOptions: { flags: ['shiny'] }
})
export default class extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const pokemon = (await args.rest('string')).toLowerCase();
		const { t } = args;

		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const pokemonData = await this.fetchAPI(t, pokemon);

		await this.buildDisplay(pokemonData, args).start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(t: TFunction, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
		}
	}

	private buildDisplay(pokemonData: DexDetails, args: PaginatedMessageCommand.Args) {
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, CdnUrls.Pokedex)
				.setThumbnail(args.getFlags('shiny') ? pokemonData.shinySprite : pokemonData.sprite)
		});

		for (const flavorText of pokemonData.flavorTexts) {
			display.addPageEmbed((embed) => embed.setDescription([`**${flavorText.game}**`, flavorText.flavor].join('\n')));
		}

		return display;
	}
}
