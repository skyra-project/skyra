import { MoveEntry } from '@favware/graphql-pokemon';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getMoveDetailsByFuzzy, parseBulbapediaURL } from '@utils/Pokemon';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.MoveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.MoveExtended),
	usage: '<move:str>'
})
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [move]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);
		const moveData = await this.fetchAPI(message, move.toLowerCase());

		const display = await this.buildDisplay(message, moveData);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, move: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getMoveDetailsByFuzzy'>(getMoveDetailsByFuzzy, { move });
			return data.getMoveDetailsByFuzzy;
		} catch {
			throw message.language.get(LanguageKeys.Commands.Pokemon.MoveQueryFail, { move });
		}
	}

	private async buildDisplay(message: KlasaMessage, moveData: MoveEntry) {
		const embedTranslations = message.language.get(LanguageKeys.Commands.Pokemon.MoveEmbedData, {
			availableInGen8: message.language.get(moveData.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});
		const externalResources = message.language.get(LanguageKeys.System.PokedexExternalResource);
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
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(embedTranslations.types, moveData.type, true)
					.addField(embedTranslations.basePower, moveData.basePower, true)
					.addField(embedTranslations.pp, moveData.pp, true)
					.addField(embedTranslations.accuracy, `${moveData.accuracy}%`, true)
					.addField(externalResources, externalSources)
			)
			.addPage((embed: MessageEmbed) =>
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
				.addField(embedTranslations.gmaxPokemon, moveData.isGMax ?? embedTranslations.none)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data)
				.addField(externalResources, externalSources)
		);
	}
}
