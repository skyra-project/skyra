import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pokeitem', 'bag'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.ItemDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.ItemExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<item:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [item]: [string]) {
		const itemDetails = await this.fetchAPI(message, item.toLowerCase());

		const language = await message.fetchLanguage();
		const embedTranslations = language.get(LanguageKeys.Commands.Pokemon.ItemEmbedData, {
			availableInGen8: language.get(itemDetails.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, CdnUrls.Pokedex)
				.setThumbnail(itemDetails.sprite)
				.setDescription(itemDetails.desc)
				.addField(embedTranslations.generationIntroduced, itemDetails.generationIntroduced, true)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
				.addField(
					language.get(LanguageKeys.System.PokedexExternalResource),
					[
						`[Bulbapedia](${parseBulbapediaURL(itemDetails.bulbapediaPage)} )`,
						`[Serebii](${itemDetails.serebiiPage})`,
						`[Smogon](${itemDetails.smogonPage})`
					].join(' | ')
				)
		);
	}

	private async fetchAPI(message: KlasaMessage, item: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getItemDetailsByFuzzy'>(getItemDetailsByFuzzy, { item });
			return data.getItemDetailsByFuzzy;
		} catch {
			throw message.fetchLocale(LanguageKeys.Commands.Pokemon.ItemQueryFail, { item });
		}
	}
}
