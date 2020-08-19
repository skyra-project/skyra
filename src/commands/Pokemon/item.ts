import { toTitleCase } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pokeitem', 'bag'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_ITEM_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_ITEM_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<item:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [item]: [string]) {
		const itemDetails = await this.fetchAPI(message, item.toLowerCase());

		const embedTranslations = message.language.get('COMMAND_ITEM_EMEBED_DATA');
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, CdnUrls.Pokedex)
				.setThumbnail(itemDetails.sprite)
				.setDescription(itemDetails.desc)
				.addField(embedTranslations.GENERATION_INTRODUCED, itemDetails.generationIntroduced, true)
				.addField(
					embedTranslations.AVAILABLE_IN_GENERATION_8_TITLE,
					embedTranslations.AVAILABLE_IN_GENERATION_8_DATA({ available: itemDetails.isNonstandard !== 'Past' }),
					true
				)
				.addField(
					message.language.get('SYSTEM_POKEDEX_EXTERNAL_RESOURCE'),
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
			throw message.language.get('COMMAND_ITEM_QUERY_FAIL', { item });
		}
	}
}
