import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokeitem', 'bag'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.ItemDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.ItemExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const item = (await args.rest('string')).toLowerCase();
		const { t } = args;

		const itemDetails = await this.fetchAPI(t, item);

		const embedTranslations = t(LanguageKeys.Commands.Pokemon.ItemEmbedData, {
			availableInGen8: t(itemDetails.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});

		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, CdnUrls.Pokedex)
				.setThumbnail(itemDetails.sprite)
				.setDescription(itemDetails.desc)
				.addField(embedTranslations.generationIntroduced, itemDetails.generationIntroduced, true)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
				.addField(
					t(LanguageKeys.System.PokedexExternalResource),
					[
						`[Bulbapedia](${parseBulbapediaURL(itemDetails.bulbapediaPage)} )`,
						`[Serebii](${itemDetails.serebiiPage})`,
						`[Smogon](${itemDetails.smogonPage})`
					].join(' | ')
				)
		);
	}

	private async fetchAPI(t: TFunction, item: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getItemDetailsByFuzzy'>(getItemDetailsByFuzzy, { item });
			return data.getItemDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.ItemQueryFail, { item });
		}
	}
}
