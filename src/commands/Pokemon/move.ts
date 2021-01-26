import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getMoveDetailsByFuzzy, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { sendLoadingMessage } from '#utils/util';
import type { MoveEntry } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.MoveDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.MoveExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const move = (await args.rest('string')).toLowerCase();
		const response = await sendLoadingMessage(message, args.t);
		const moveData = await this.fetchAPI(move, args.t);

		const display = await this.buildDisplay(message, moveData, args.t);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(move: string, t: TFunction) {
		try {
			const { data } = await fetchGraphQLPokemon<'getMoveDetailsByFuzzy'>(getMoveDetailsByFuzzy, { move });
			return data.getMoveDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.MoveQueryFail, { move });
		}
	}

	private async buildDisplay(message: GuildMessage, moveData: MoveEntry, t: TFunction) {
		const embedTranslations = t(LanguageKeys.Commands.Pokemon.MoveEmbedData, {
			availableInGen8: t(moveData.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalSources = [
			`[Bulbapedia](${parseBulbapediaURL(moveData.bulbapediaPage)} )`,
			`[Serebii](${moveData.serebiiPage})`,
			`[Smogon](${moveData.smogonPage})`
		].join(' | ');

		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.move} - ${toTitleCase(moveData.name)}`, CdnUrls.Pokedex)
				.setDescription(moveData.desc || moveData.shortDesc)
		})
			.addPageEmbed((embed) => {
				if (moveData.isFieldMove) {
					embed.addField(embedTranslations.fieldMoveEffectTitle, moveData.isFieldMove, false);
				}

				return embed
					.addField(embedTranslations.types, moveData.type, true)
					.addField(embedTranslations.basePower, moveData.basePower, true)
					.addField(embedTranslations.pp, moveData.pp, true)
					.addField(embedTranslations.accuracy, `${moveData.accuracy}%`, true)
					.addField(externalResources, externalSources);
			})
			.addPageEmbed((embed) =>
				embed
					.addField(embedTranslations.category, moveData.category, true)
					.addField(embedTranslations.priority, moveData.priority, true)
					.addField(embedTranslations.target, moveData.target, true)
					.addField(embedTranslations.contestCondition, moveData.contestType ?? embedTranslations.none, true)
					.addField(externalResources, externalSources)
			);

		// If the move has zMovePower or maxMovePower then squeeze it in between as a page
		if (moveData.zMovePower || moveData.maxMovePower) {
			display.addPageEmbed((embed) => {
				if (moveData.maxMovePower) embed.addField(embedTranslations.maxMovePower, moveData.maxMovePower);
				if (moveData.zMovePower) embed.addField(embedTranslations.zMovePower, moveData.zMovePower);

				embed.addField(externalResources, externalSources);
				return embed;
			});
		}

		return display.addPageEmbed((embed) =>
			embed
				.addField(embedTranslations.zCrystal, moveData.isZ ?? embedTranslations.none, true)
				.addField(embedTranslations.gmaxPokemon, moveData.isGMax ?? embedTranslations.none, true)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
				.addField(externalResources, externalSources)
		);
	}
}
