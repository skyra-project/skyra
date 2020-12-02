import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { LearnMethodTypesReturn } from '#lib/types/namespaces/languages/commands/Pokemon';
import { BrandingColors } from '#utils/constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, resolveColour } from '#utils/Pokemon';
import { pickRandom } from '#utils/util';
import { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

const kPokemonGenerations = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.LearnDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.LearnExtended),
	usage: '[generation:generation] <pokemon:string> <moves:...string> ',
	usageDelim: ' ',
	flagSupport: true
})
@CreateResolvers([
	[
		'generation',
		async (arg, possible, message) => {
			if (kPokemonGenerations.has(arg)) return message.client.arguments.get('integer')!.run(arg, possible, message);
			throw await message.fetchLocale(LanguageKeys.Commands.Pokemon.LearnInvalidGeneration, { generation: arg });
		}
	]
])
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [generation = 8, pokemon, moves]: [number, string, string]) {
		const language = await message.fetchLanguage();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const movesList = moves.split(', ');
		const learnsetData = await this.fetchAPI(pokemon, movesList, generation, language);

		await this.buildDisplay(message, learnsetData, generation, movesList, language) //
			.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(pokemon: string, moves: string[], generation: number, language: Language) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonLearnsetByFuzzy'>(getPokemonLearnsetByFuzzy, { pokemon, moves, generation });
			return data.getPokemonLearnsetByFuzzy;
		} catch {
			throw language.get(LanguageKeys.Commands.Pokemon.LearnQueryFailed, {
				pokemon,
				moves: language.list(moves, language.get(LanguageKeys.Globals.And))
			});
		}
	}

	private parseMove(language: Language, pokemon: string, generation: number, move: string, method: string) {
		return language.get(LanguageKeys.Commands.Pokemon.LearnMethod, { generation, pokemon, move, method });
	}

	private buildDisplay(message: GuildMessage, learnsetData: LearnsetEntry, generation: number, moves: string[], language: Language) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(language.get(LanguageKeys.Commands.Pokemon.LearnTitle, { pokemon: learnsetData.species, generation }))
				.setThumbnail(message.flagArgs.shiny ? learnsetData.shinySprite : learnsetData.sprite)
		);

		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof LearnMethodTypesReturn, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addPage((embed: MessageEmbed) =>
				embed.setDescription(
					language.get(LanguageKeys.Commands.Pokemon.LearnCannotLearn, {
						pokemon: learnsetData.species,
						moves: language.list(moves, language.get(LanguageKeys.Globals.Or))
					})
				)
			);
		}

		for (const [methodName, methodData] of learnableMethods) {
			const method = methodData.map((move) => {
				const methodTypes = language.get(LanguageKeys.Commands.Pokemon.LearnMethodTypes, { level: move.level });
				return this.parseMove(language, learnsetData.species, move.generation!, move.name!, methodTypes[methodName]);
			});

			display.addPage((embed) => embed.setDescription(method));
		}

		return display;
	}
}
