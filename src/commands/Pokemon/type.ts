import { TypeEntry, TypeMatchups, Types } from '@favware/graphql-pokemon';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getTypeMatchup, parseBulbapediaURL } from '@utils/Pokemon';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

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

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['matchup', 'weakness', 'advantage'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Pokemon.TypeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Pokemon.TypeExtended),
	usage: '<types:type{2}>'
})
@CreateResolvers([
	[
		'type',
		(arg: string | string[], _, message) => {
			arg = (arg as string).toLowerCase().split(' ');

			if (arg.length > 2) throw message.language.get(LanguageKeys.Commands.Pokemon.TypeTooManyTypes);

			for (const type of arg) {
				if (!kPokemonTypes.has(type)) throw message.language.get(LanguageKeys.Commands.Pokemon.TypeNotAType, { type });
			}

			return arg;
		}
	]
])
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [types]: [Types[]]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);
		const typeMatchups = await this.fetchAPI(message, types);

		const display = await this.buildDisplay(message, types, typeMatchups);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, types: Types[]) {
		try {
			const { data } = await fetchGraphQLPokemon<'getTypeMatchup'>(getTypeMatchup, { types });
			return data.getTypeMatchup;
		} catch {
			throw message.language.get(LanguageKeys.Commands.Pokemon.TypeQueryFail, {
				types: types.map((val) => `\`${val}\``).join(` ${message.language.get(LanguageKeys.Globals.And)} `)
			});
		}
	}

	private parseEffectiveMatchup(doubleEffectiveTypes: TypeEntry['doubleEffectiveTypes'], effectiveTypes: TypeEntry['effectiveTypes']) {
		return doubleEffectiveTypes
			.map((type) => `${type} (x4)`)
			.concat(effectiveTypes.map((type) => `${type} (x2)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseResistedMatchup(doubleResistedTypes: TypeEntry['doubleResistedTypes'], resistedTypes: TypeEntry['resistedTypes']) {
		return doubleResistedTypes
			.map((type) => `${type} (x0.25)`)
			.concat(resistedTypes.map((type) => `${type} (x0.5)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseRegularMatchup(regularMatchup: TypeEntry['normalTypes'] | TypeEntry['effectlessTypes']) {
		return regularMatchup.map((type) => `\`${type}\``).join(', ');
	}

	private async buildDisplay(message: KlasaMessage, types: Types[], typeMatchups: TypeMatchups) {
		const embedTranslations = message.language.get(LanguageKeys.Commands.Pokemon.TypeEmbedData, { types });
		const externalResources = message.language.get(LanguageKeys.System.PokedexExternalResource);
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
