import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchGraphQLPokemon, getAbilityDetailsByFuzzy, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { CdnUrls, PermissionFlags } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['abilities', 'pokeability'],
	description: LanguageKeys.Commands.Pokemon.AbilityDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.AbilityExtended,
	requiredClientPermissions: [PermissionFlags.EMBED_LINKS]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const ability = await args.rest('string');
		const { t } = args;

		const abilityDetails = await this.fetchAPI(ability.toLowerCase());
		const embedTitles = t(LanguageKeys.Commands.Pokemon.AbilityEmbedTitles);

		const externalResources = [
			`[Bulbapedia](${parseBulbapediaURL(abilityDetails.bulbapediaPage)} )`,
			`[Serebii](${abilityDetails.serebiiPage})`,
			`[Smogon](${abilityDetails.smogonPage})`
		].join(' | ');

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setAuthor(`${embedTitles.authorTitle} - ${toTitleCase(abilityDetails.name)}`, CdnUrls.Pokedex)
			.setDescription(abilityDetails.desc || abilityDetails.shortDesc)
			.addField(t(LanguageKeys.System.PokedexExternalResource), externalResources);

		if (abilityDetails.isFieldAbility) {
			embed.spliceFields(0, 0, { name: embedTitles.fieldEffectTitle, value: abilityDetails.isFieldAbility, inline: false });
		}

		return send(message, { embeds: [embed] });
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
