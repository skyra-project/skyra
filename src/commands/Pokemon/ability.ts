import { toTitleCase } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['abilities', 'pokeability'],
	cooldown: 10,
	description: language => language.tget('COMMAND_ABILITY_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ABILITY_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<ability:str>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [ability]: [string]) {
		const abilityDetails = await this.fetchAPI(message, ability.toLowerCase());

		const embedTranslations = message.language.tget('COMMAND_ABILITY_EMBED_DATA');
		return message.sendEmbed(new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setAuthor(`${embedTranslations.ABILITY} - ${toTitleCase(abilityDetails.name)}`, POKEMON_EMBED_THUMBNAIL)
			.setDescription(abilityDetails.desc || abilityDetails.shortDesc)
			.addField(embedTranslations.EXTERNAL_RESOURCES, [
				`[Bulbapedia](${parseBulbapediaURL(abilityDetails.bulbapediaPage)} )`,
				`[Serebii](${abilityDetails.serebiiPage})`,
				`[Smogon](${abilityDetails.smogonPage})`
			].join(' | ')));
	}

	private async fetchAPI(message: KlasaMessage, ability: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getAbilityDetailsByFuzzy'>(getAbilityDetailsByFuzzy, { ability });
			return data.getAbilityDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_ABILITY_QUERY_FAIL', ability);
		}
	}

}
