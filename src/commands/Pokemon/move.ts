import { MoveEntry } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getMoveDetailsByFuzzy, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL } from '@utils/Pokemon';
import { getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_MOVE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_MOVE_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<move:str>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [move]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));
		const moveData = await this.fetchAPI(message, move.toLowerCase());

		await this.buildDisplay(message, moveData).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, move: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getMoveDetailsByFuzzy'>(getMoveDetailsByFuzzy, { move });
			return data.getMoveDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_MOVE_QUERY_FAIL', move);
		}
	}

	private buildDisplay(message: KlasaMessage, moveData: MoveEntry) {
		const embedTranslations = message.language.tget('COMMAND_MOVE_EMBED_DATA');

		return new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(`${embedTranslations.MOVE} - ${toTitleCase(moveData.name)}`, POKEMON_EMBED_THUMBNAIL)
			.setDescription(moveData.desc || moveData.shortDesc))
			.addPage((embed: MessageEmbed) => embed
				.addField(embedTranslations.TYPE, moveData.type, true)
				.addField(embedTranslations.BASE_POWER, moveData.basePower, true)
				.addField(embedTranslations.PP, moveData.pp, true)
				.addField(embedTranslations.ACCURACY, `${moveData.accuracy}%`, true)
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(moveData.bulbapediaPage)} )`,
					`[Serebii](${moveData.serebiiPage})`,
					`[Smogon](${moveData.smogonPage})`
				].join(' | ')))
			.addPage((embed: MessageEmbed) => embed
				.addField(embedTranslations.CATEGORY, moveData.category, true)
				.addField(embedTranslations.PRIORITY, moveData.priority, true)
				.addField(embedTranslations.TARGET, moveData.target, true)
				.addField(embedTranslations.CONTEST_CONDITION, moveData.contestType ?? embedTranslations.NONE, true)
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(moveData.bulbapediaPage)} )`,
					`[Serebii](${moveData.serebiiPage})`,
					`[Smogon](${moveData.smogonPage})`
				].join(' | ')))
			.addPage((embed: MessageEmbed) => embed
				.addField(embedTranslations.Z_CRYSTAL, moveData.isZ ?? embedTranslations.NONE, true)
				.addField(embedTranslations.GMAX_POKEMON, moveData.isGMax ?? embedTranslations.NONE)
				.addField(embedTranslations.AVAILABLE_IN_GENERATION_8_TITLE, embedTranslations.AVAILABLE_IN_GENERATION_8_DATA(moveData.isNonstandard !== 'Past'))
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(moveData.bulbapediaPage)} )`,
					`[Serebii](${moveData.serebiiPage})`,
					`[Smogon](${moveData.smogonPage})`
				].join(' | ')));
	}

}
