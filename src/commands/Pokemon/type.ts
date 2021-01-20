import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RichDisplayCommand, UserRichDisplay } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchGraphQLPokemon, getTypeMatchup, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import type { TypeEntry, TypeMatchups, Types } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const kPokemonTypes = new Set([
	'bug',
	'dark',
	'dragon',
	'electric',
	'fairy',
	'fighting',
	'fire',
	'flying',
	'ghost',
	'grass',
	'ground',
	'ice',
	'normal',
	'poison',
	'psychic',
	'rock',
	'steel',
	'water'
]);

@ApplyOptions<RichDisplayCommand.Options>({
	aliases: ['matchup', 'weakness', 'advantage'],
	cooldown: 10,
	description: LanguageKeys.Commands.Pokemon.TypeDescription,
	extendedHelp: LanguageKeys.Commands.Pokemon.TypeExtended,
	usage: '<types:type{2}>'
})
@CreateResolvers([
	[
		'type',
		async (arg: string | string[], _, message) => {
			arg = (arg as string).toLowerCase().split(' ');

			if (arg.length > 2) throw await message.resolveKey(LanguageKeys.Commands.Pokemon.TypeTooManyTypes);

			for (const type of arg) {
				if (!kPokemonTypes.has(type)) throw await message.resolveKey(LanguageKeys.Commands.Pokemon.TypeNotAType, { type });
			}

			return arg;
		}
	]
])
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [types]: [Types[]]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);
		const typeMatchups = await this.fetchAPI(types, t);

		const display = await this.buildDisplay(message, types, typeMatchups, t);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(types: Types[], t: TFunction) {
		try {
			const { data } = await fetchGraphQLPokemon<'getTypeMatchup'>(getTypeMatchup, { types });
			return data.getTypeMatchup;
		} catch {
			throw t(LanguageKeys.Commands.Pokemon.TypeQueryFail, {
				types: types.map((val) => `\`${val}\``)
			});
		}
	}

	private parseEffectiveMatchup(doubleEffectiveTypes: TypeEntry['doubleEffectiveTypes'], effectiveTypes: TypeEntry['effectiveTypes']) {
		return doubleEffectiveTypes
			.map((type): string => `${type} (x4)`)
			.concat(effectiveTypes.map((type) => `${type} (x2)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseResistedMatchup(doubleResistedTypes: TypeEntry['doubleResistedTypes'], resistedTypes: TypeEntry['resistedTypes']) {
		return doubleResistedTypes
			.map((type): string => `${type} (x0.25)`)
			.concat(resistedTypes.map((type) => `${type} (x0.5)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseRegularMatchup(regularMatchup: TypeEntry['normalTypes'] | TypeEntry['effectlessTypes']) {
		return regularMatchup.map((type) => `\`${type}\``).join(', ');
	}

	private async buildDisplay(message: GuildMessage, types: Types[], typeMatchups: TypeMatchups, t: TFunction) {
		const embedTranslations = t(LanguageKeys.Commands.Pokemon.TypeEmbedData, { types });
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalSources = [
			`[Bulbapedia](${parseBulbapediaURL(`https://bulbapedia.bulbagarden.net/wiki/${types[0]}_(type)`)} )`,
			`[Serebii](https://www.serebii.net/pokedex-sm/${types[0].toLowerCase()}.shtml)`,
			`[Smogon](http://www.smogon.com/dex/sm/types/${types[0]})`
		].join(' | ');

		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message)) //
				.setAuthor(`${embedTranslations.typeEffectivenessFor}`, CdnUrls.Pokedex) //
		)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(
						embedTranslations.offensive,
						[
							`${embedTranslations.superEffectiveAgainst}: ${this.parseEffectiveMatchup(
								typeMatchups.attacking.doubleEffectiveTypes,
								typeMatchups.attacking.effectiveTypes
							)}`,
							'',
							`${embedTranslations.dealsNormalDamageTo}: ${this.parseRegularMatchup(typeMatchups.attacking.normalTypes)}`,
							'',
							`${embedTranslations.notVeryEffectiveAgainst}: ${this.parseResistedMatchup(
								typeMatchups.attacking.doubleResistedTypes,
								typeMatchups.attacking.resistedTypes
							)}`,
							'',
							`${
								typeMatchups.attacking.effectlessTypes.length
									? `${embedTranslations.doesNotAffect}: ${this.parseRegularMatchup(typeMatchups.attacking.effectlessTypes)}`
									: ''
							}`
						].join('\n')
					)
					.addField(externalResources, externalSources)
			)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(
						embedTranslations.defensive,
						[
							`${embedTranslations.vulnerableTo}: ${this.parseEffectiveMatchup(
								typeMatchups.defending.doubleEffectiveTypes,
								typeMatchups.defending.effectiveTypes
							)}`,
							'',
							`${embedTranslations.takesNormalDamageFrom}: ${this.parseRegularMatchup(typeMatchups.defending.normalTypes)}`,
							'',
							`${embedTranslations.resists}: ${this.parseResistedMatchup(
								typeMatchups.defending.doubleResistedTypes,
								typeMatchups.defending.resistedTypes
							)}`,
							'',
							`${
								typeMatchups.defending.effectlessTypes.length
									? `${embedTranslations.notAffectedBy}: ${this.parseRegularMatchup(typeMatchups.defending.effectlessTypes)}`
									: ''
							}`
						].join('\n')
					)
					.addField(externalResources, externalSources)
			);
	}
}
