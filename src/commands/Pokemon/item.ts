import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pokeitem', 'bag'],
	cooldown: 10,
	description: (language) => language.get('commandItemDescription'),
	extendedHelp: (language) => language.get('commandItemExtended'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<item:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [item]: [string]) {
		const itemDetails = await this.fetchAPI(message, item.toLowerCase());

		const embedTranslations = message.language.get('commandItemEmebedData', { availableInGen8: itemDetails.isNonstandard !== 'Past' });
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, CdnUrls.Pokedex)
				.setThumbnail(itemDetails.sprite)
				.setDescription(itemDetails.desc)
				.addField(embedTranslations.generationIntroduced, itemDetails.generationIntroduced, true)
				.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
				.addField(
					message.language.get('systemPokedexExternalResource'),
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
			throw message.language.get('commandItemQueryFail', { item });
		}
	}
}
