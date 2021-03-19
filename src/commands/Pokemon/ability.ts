import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['abilities', 'pokeability'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.AbilityDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.AbilityExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const ability = await args.rest('string');
		const { t } = args;

		const abilityDetails = await this.fetchAPI(ability.toLowerCase());
		const embedTitles = t(LanguageKeys.Commands.Pokemon.AbilityEmbedTitles);

		const embed = new MessageEmbed()
			.setColor(await this.context.db.fetchColor(message))
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

	private async fetchAPI(ability: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getAbilityDetailsByFuzzy'>(getAbilityDetailsByFuzzy, { ability });
			return data.getAbilityDetailsByFuzzy;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.AbilityQueryFail, { ability });
		}
	}
}
