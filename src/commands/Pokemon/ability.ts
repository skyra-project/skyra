import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['abilities', 'pokeability'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_ABILITY_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_ABILITY_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<ability:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [ability]: [string]) {
		const abilityDetails = await this.fetchAPI(message, ability.toLowerCase());

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(`${message.language.get('COMMAND_ABILITY_EMBED_TITLE')} - ${toTitleCase(abilityDetails.name)}`, CdnUrls.Pokedex)
				.setDescription(abilityDetails.desc || abilityDetails.shortDesc)
				.addField(
					message.language.get('SYSTEM_POKEDEX_EXTERNAL_RESOURCE'),
					[
						`[Bulbapedia](${parseBulbapediaURL(abilityDetails.bulbapediaPage)} )`,
						`[Serebii](${abilityDetails.serebiiPage})`,
						`[Smogon](${abilityDetails.smogonPage})`
					].join(' | ')
				)
		);
	}

	private async fetchAPI(message: KlasaMessage, ability: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getAbilityDetailsByFuzzy'>(getAbilityDetailsByFuzzy, { ability });
			return data.getAbilityDetailsByFuzzy;
		} catch {
			throw message.language.get('COMMAND_ABILITY_QUERY_FAIL', { ability });
		}
	}
}
