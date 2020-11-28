import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetchGraphQLPokemon, getMoveDetailsByFuzzy, parseBulbapediaURL } from '#utils/Pokemon';
import { pickRandom } from '#utils/util';
import { MoveEntry } from '@favware/graphql-pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.MoveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.MoveExtended),
	usage: '<move:str>'
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [move]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);
		const moveData = await this.fetchAPI(move.toLowerCase(), language);

		const display = await this.buildDisplay(message, moveData, language);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(move: string, language: Language) {
		try {
			const { data } = await fetchGraphQLPokemon<'getMoveDetailsByFuzzy'>(getMoveDetailsByFuzzy, { move });
			return data.getMoveDetailsByFuzzy;
		} catch {
			throw language.get(LanguageKeys.Commands.Pokemon.MoveQueryFail, { move });
		}
	}

	private async buildDisplay(message: GuildMessage, moveData: MoveEntry, language: Language) {
		const embedTranslations = language.get(LanguageKeys.Commands.Pokemon.MoveEmbedData, {
			availableInGen8: language.get(moveData.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});
		const externalResources = language.get(LanguageKeys.System.PokedexExternalResource);
		const externalSources = [
			`[Bulbapedia](${parseBulbapediaURL(moveData.bulbapediaPage)} )`,
			`[Serebii](${moveData.serebiiPage})`,
			`[Smogon](${moveData.smogonPage})`
		].join(' | ');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.move} - ${toTitleCase(moveData.name)}`, CdnUrls.Pokedex)
				.setDescription(moveData.desc || moveData.shortDesc)
		)
			.addPage((embed) => {
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
			.addPage((embed) =>
				embed
					.addField(embedTranslations.category, moveData.category, true)
					.addField(embedTranslations.priority, moveData.priority, true)
					.addField(embedTranslations.target, moveData.target, true)
					.addField(embedTranslations.contestCondition, moveData.contestType ?? embedTranslations.none, true)
					.addField(externalResources, externalSources)
			);

		// If the move has zMovePower or maxMovePower then squeeze it in between as a page
		if (moveData.zMovePower || moveData.maxMovePower) {
			display.addPage((embed: MessageEmbed) => {
				if (moveData.maxMovePower) embed.addField(embedTranslations.maxMovePower, moveData.maxMovePower);
				if (moveData.zMovePower) embed.addField(embedTranslations.zMovePower, moveData.zMovePower);

				embed.addField(externalResources, externalSources);
				return embed;
			});
		}

		return display.addPage((embed: MessageEmbed) =>
			embed
				.addField(embedTranslations.zCrystal, moveData.isZ ?? embedTranslations.none, true)
				.addField(embedTranslations.gmaxPokemon, moveData.isGMax ?? embedTranslations.none, true)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
				.addField(externalResources, externalSources)
		);
	}
}
