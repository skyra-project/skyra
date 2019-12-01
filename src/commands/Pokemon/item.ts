import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL } from '../../lib/util/Pokemon';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pokeitem', 'bag'],
			cooldown: 10,
			description: language => language.tget('COMMAND_ITEM_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ITEM_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<item:str>'
		});
	}

	public async run(message: KlasaMessage, [item]: [string]) {
		const itemDetails = await this.fetchAPI(message, item.toLowerCase());

		const embedTranslations = message.language.tget('COMMAND_ITEM_EMEBED_DATA');
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, POKEMON_EMBED_THUMBNAIL)
			.setThumbnail(itemDetails.sprite)
			.setDescription(itemDetails.desc)
			.addField(embedTranslations.GENERATION_INTRODUCED, itemDetails.generationIntroduced, true)
			.addField(
				embedTranslations.AVAILABLE_IN_GENERATION_8_TITLE,
				embedTranslations.AVAILABLE_IN_GENERATION_8_DATA(itemDetails.isNonstandard !== 'Past'),
				true
			)
			.addField(embedTranslations.EXTERNAL_RESOURCES, [
				`[Bulbapedia](${parseBulbapediaURL(itemDetails.bulbapediaPage)} )`,
				`[Serebii](${itemDetails.serebiiPage})`,
				`[Smogon](${itemDetails.smogonPage})`
			].join(' | ')));
	}

	private async fetchAPI(message: KlasaMessage, item: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getItemDetailsByFuzzy'>(getItemDetailsByFuzzy(item));
			return data.getItemDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_ITEM_QUERY_FAIL', item);
		}
	}

}
