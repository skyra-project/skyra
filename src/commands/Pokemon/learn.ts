import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { LearnMethodTypesReturn } from '#lib/i18n/languageKeys/keys/commands/Pokemon';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, resolveColour } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import type { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const kPokemonGenerations = new Set([1, 2, 3, 4, 5, 6, 7, 8]);

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.LearnDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.LearnExtended,
	strategyOptions: { flags: ['shiny'] }
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const generation = await args.pick(UserPaginatedMessageCommand.generation).catch(() => 8);
		const pokemon = await args.pick('string');
		const moves = await args.rest('string');
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const movesList = moves.split(',').map((move) => move.trim());
		const learnsetData = await this.fetchAPI(pokemon, movesList, generation, t);

		await this.buildDisplay(learnsetData, generation, movesList, args) //
			.start(response as GuildMessage, message.author);
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

	private buildDisplay(learnsetData: LearnsetEntry, generation: number, moves: string[], args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(t(LanguageKeys.Commands.Pokemon.LearnTitle, { pokemon: learnsetData.species, generation }))
				.setThumbnail(args.getFlags('shiny') ? learnsetData.shinySprite : learnsetData.sprite)
		});

		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof LearnMethodTypesReturn, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addPageEmbed((embed) =>
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

			display.addPageEmbed((embed) => embed.setDescription(method));
		}

		return display;
	}

	private static generation = Args.make<number>((parameter, { argument }) => {
		const numberParameter = Number(parameter);
		if (numberParameter && kPokemonGenerations.has(numberParameter)) return Args.ok(numberParameter);
		return Args.error({
			parameter,
			argument,
			identifier: LanguageKeys.Commands.Pokemon.LearnInvalidGeneration,
			context: { generation: parameter }
		});
	});
}
