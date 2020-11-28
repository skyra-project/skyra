import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { CdnUrls } from '#lib/types/Constants';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, resolveColour } from '#utils/Pokemon';
import { pickRandom } from '#utils/util';
import { DexDetails } from '@favware/graphql-pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.FlavorsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.FlavorsExtended),
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [pokemon]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const pokemonData = await this.fetchAPI(language, pokemon.toLowerCase());

		await this.buildDisplay(message, pokemonData).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw language.get(LanguageKeys.Commands.Pokemon.FlavorsQueryFail, { pokemon });
		}
	}

	private buildDisplay(message: GuildMessage, pokemonData: DexDetails) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, CdnUrls.Pokedex)
				.setThumbnail(message.flagArgs.shiny ? pokemonData.shinySprite : pokemonData.sprite)
		);

		for (const flavorText of pokemonData.flavorTexts) {
			display.addPage((embed: MessageEmbed) => embed.setDescription([`**${flavorText.game}**`, flavorText.flavor].join('\n')));
		}

		return display;
	}
}
