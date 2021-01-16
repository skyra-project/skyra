import { LanguageKeys } from '#lib/i18n/languageKeys';
import { LearnMethodTypesReturn } from '#lib/i18n/languageKeys/keys/commands/Pokemon';
import { PaginatedMessageCommand, PaginatedMessageCommandOptions } from '#lib/structures/commands/PaginatedMessageCommand';
import { UserPaginatedMessage } from '#lib/structures/UserPaginatedMessage';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, resolveColour } from '#utils/APIs/Pokemon';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

const kPokemonGenerations = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);

@ApplyOptions<PaginatedMessageCommandOptions>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.LearnDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.LearnExtended,
	usage: '[generation:generation] <pokemon:string> <moves:...string> ',
	usageDelim: ' ',
	flagSupport: true
})
@CreateResolvers([
	[
		'generation',
		async (arg, possible, message) => {
			if (kPokemonGenerations.has(arg)) return message.client.arguments.get('integer')!.run(arg, possible, message);
			throw await message.resolveKey(LanguageKeys.Commands.Pokemon.LearnInvalidGeneration, { generation: arg });
		}
	]
])
export default class extends PaginatedMessageCommand {
	public async run(message: GuildMessage, [generation = 8, pokemon, moves]: [number, string, string]) {
		const t = await message.fetchT();
		const response = (await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		)) as GuildMessage;

		const movesList = moves.split(', ');
		const learnsetData = await this.fetchAPI(pokemon, movesList, generation, t);

		await this.buildDisplay(message, learnsetData, generation, movesList, t) //
			.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(pokemon: string, moves: string[], generation: number, t: TFunction) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonLearnsetByFuzzy'>(getPokemonLearnsetByFuzzy, { pokemon, moves, generation });
			return data.getPokemonLearnsetByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.LearnQueryFailed, {
				pokemon,
				moves
			});
		}
	}

	private parseMove(t: TFunction, pokemon: string, generation: number, move: string, method: string) {
		return t(LanguageKeys.Commands.Pokemon.LearnMethod, { generation, pokemon, move, method });
	}

	private buildDisplay(message: GuildMessage, learnsetData: LearnsetEntry, generation: number, moves: string[], t: TFunction) {
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(t(LanguageKeys.Commands.Pokemon.LearnTitle, { pokemon: learnsetData.species, generation }))
				.setThumbnail(message.flagArgs.shiny ? learnsetData.shinySprite : learnsetData.sprite)
		});

		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof LearnMethodTypesReturn, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addTemplatedEmbedPage((embed: MessageEmbed) =>
				embed.setDescription(
					t(LanguageKeys.Commands.Pokemon.LearnCannotLearn, {
						pokemon: learnsetData.species,
						moves
					})
				)
			);
		}

		for (const [methodName, methodData] of learnableMethods) {
			const method = methodData.map((move) => {
				const methodTypes = t(LanguageKeys.Commands.Pokemon.LearnMethodTypes, { level: move.level });
				return this.parseMove(t, learnsetData.species, move.generation!, move.name!, methodTypes[methodName]);
			});

			display.addTemplatedEmbedPage((embed) => embed.setDescription(method));
		}

		return display;
	}
}
