import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getItemDetailsByFuzzy, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { send } from '@skyra/editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pokeitem', 'bag'],
	description: LanguageKeys.Commands.Pokemon.ItemDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.ItemExtended,
	requiredClientPermissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const item = (await args.rest('string')).toLowerCase();
		const { t } = args;

		const itemDetails = await this.fetchAPI(item);

		const embedTranslations = t(LanguageKeys.Commands.Pokemon.ItemEmbedData, {
			availableInGen8: t(itemDetails.isNonstandard === 'Past' ? LanguageKeys.Globals.No : LanguageKeys.Globals.Yes)
		});

		const externalResources = [
			`[Bulbapedia](${parseBulbapediaURL(itemDetails.bulbapediaPage)} )`,
			`[Serebii](${itemDetails.serebiiPage})`,
			itemDetails.smogonPage ? `[Smogon](${itemDetails.smogonPage})` : undefined
		]
			.filter(Boolean)
			.join(' | ');

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setAuthor(`${embedTranslations.ITEM} - ${toTitleCase(itemDetails.name)}`, CdnUrls.Pokedex)
			.setThumbnail(itemDetails.sprite)
			.setDescription(itemDetails.desc)
			.addField(embedTranslations.generationIntroduced, t(LanguageKeys.Globals.NumberValue, { value: itemDetails.generationIntroduced }), true)
			.addField(embedTranslations.availableInGeneration8Title, embedTranslations.availableInGeneration8Data, true)
			.addField(t(LanguageKeys.System.PokedexExternalResource), externalResources);
		return send(message, { embeds: [embed] });
	}

	private async fetchAPI(item: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getItemDetailsByFuzzy'>(getItemDetailsByFuzzy, { item });
			return data.getItemDetailsByFuzzy;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.ItemQueryFail, { item });
		}
	}
}
