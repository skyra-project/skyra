import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL } from '#utils/Pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['abilities', 'pokeability'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.AbilityDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.AbilityExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<ability:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [ability]: [string]) {
		const t = await message.fetchT();
		const abilityDetails = await this.fetchAPI(t, ability.toLowerCase());
		const embedTitles = t(LanguageKeys.Commands.Pokemon.AbilityEmbedTitles, { returnObjects: true });

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setAuthor(`${embedTitles.authorTitle} - ${toTitleCase(abilityDetails.name)}`, CdnUrls.Pokedex)
			.setDescription(abilityDetails.desc || abilityDetails.shortDesc)
			.addField(
				t(LanguageKeys.System.PokedexExternalResource),
				[
					`[Bulbapedia](${parseBulbapediaURL(abilityDetails.bulbapediaPage)} )`,
					`[Serebii](${abilityDetails.serebiiPage})`,
					`[Smogon](${abilityDetails.smogonPage})`
				].join(' | ')
			);

		if (abilityDetails.isFieldAbility) {
			embed.spliceFields(0, 0, { name: embedTitles.fieldEffectTitle, value: abilityDetails.isFieldAbility, inline: false });
		}

		return message.send(embed);
	}

	private async fetchAPI(t: TFunction, ability: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getAbilityDetailsByFuzzy'>(getAbilityDetailsByFuzzy, { ability });
			return data.getAbilityDetailsByFuzzy;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.AbilityQueryFail, { ability });
		}
	}
}
