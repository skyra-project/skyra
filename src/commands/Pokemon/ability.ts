import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL } from '#utils/Pokemon';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['abilities', 'pokeability'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.AbilityDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.AbilityExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<ability:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [ability]: [string]) {
		const language = await message.fetchLanguage();
		const abilityDetails = await this.fetchAPI(language, ability.toLowerCase());
		const embedTitles = language.get(LanguageKeys.Commands.Pokemon.AbilityEmbedTitles);

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setAuthor(`${embedTitles.authorTitle} - ${toTitleCase(abilityDetails.name)}`, CdnUrls.Pokedex)
			.setDescription(abilityDetails.desc || abilityDetails.shortDesc)
			.addField(
				language.get(LanguageKeys.System.PokedexExternalResource),
				[
					`[Bulbapedia](${parseBulbapediaURL(abilityDetails.bulbapediaPage)} )`,
					`[Serebii](${abilityDetails.serebiiPage})`,
					`[Smogon](${abilityDetails.smogonPage})`
				].join(' | ')
			);

		if (abilityDetails.isFieldAbility) {
			embed.spliceFields(0, 0, { name: embedTitles.fieldEffectTitle, value: abilityDetails.isFieldAbility, inline: false });
		}

		return message.sendEmbed(embed);
	}

	private async fetchAPI(language: Language, ability: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getAbilityDetailsByFuzzy'>(getAbilityDetailsByFuzzy, { ability });
			return data.getAbilityDetailsByFuzzy;
		} catch {
			throw language.get(LanguageKeys.Commands.Pokemon.AbilityQueryFail, { ability });
		}
	}
}
