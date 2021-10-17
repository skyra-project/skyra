import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { fetchGraphQLPokemon, getTypeMatchup, parseBulbapediaURL } from '#utils/APIs/Pokemon';
import { CdnUrls } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import type { Type, TypeMatchup, TypesEnum } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
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

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['matchup', 'weakness', 'advantage'],
	description: LanguageKeys.Commands.Pokemon.TypeDescription,
	detailedDescription: LanguageKeys.Commands.Pokemon.TypeExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const types = await args.rest(UserPaginatedMessageCommand.type);
		const response = await sendLoadingMessage(message, t);
		const typeMatchups = await this.fetchAPI(types);

		const display = await this.buildDisplay(message, types, typeMatchups, t);
		await display.run(response, message.author);
		return response;
	}

	private async fetchAPI(types: TypesEnum[]) {
		try {
			const { data } = await fetchGraphQLPokemon<'getTypeMatchup'>(getTypeMatchup, { types });
			return data.getTypeMatchup;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.TypeQueryFail, {
				types: types.map((val) => `\`${val}\``)
			});
		}
	}

	private parseEffectiveMatchup(doubleEffectiveTypes: Type['doubleEffectiveTypes'], effectiveTypes: Type['effectiveTypes']) {
		return doubleEffectiveTypes
			.map((type): string => `${type} (x4)`)
			.concat(effectiveTypes.map((type) => `${type} (x2)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseResistedMatchup(doubleResistedTypes: Type['doubleResistedTypes'], resistedTypes: Type['resistedTypes']) {
		return doubleResistedTypes
			.map((type): string => `${type} (x0.25)`)
			.concat(resistedTypes.map((type) => `${type} (x0.5)`))
			.map((type) => `\`${type}\``)
			.join(', ');
	}

	private parseRegularMatchup(regularMatchup: Type['normalTypes'] | Type['effectlessTypes']) {
		return regularMatchup.map((type) => `\`${type}\``).join(', ');
	}

	private async buildDisplay(message: GuildMessage, types: TypesEnum[], typeMatchups: TypeMatchup, t: TFunction) {
		const embedTranslations = t(LanguageKeys.Commands.Pokemon.TypeEmbedData, { types });
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalSources = [
			`[Bulbapedia](${parseBulbapediaURL(`https://bulbapedia.bulbagarden.net/wiki/${types[0]}_(type)`)} )`,
			`[Serebii](https://www.serebii.net/pokedex-sm/${types[0].toLowerCase()}.shtml)`,
			`[Smogon](http://www.smogon.com/dex/sm/types/${types[0]})`
		].join(' | ');

		return new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.container.db.fetchColor(message)) //
				.setAuthor(`${embedTranslations.typeEffectivenessFor}`, CdnUrls.Pokedex) //
		})
			.addPageEmbed((embed) =>
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
			.addPageEmbed((embed) =>
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

	private static type = Args.make<TypesEnum[]>((parameter, { argument }) => {
		const lowerCasedSplitArguments = parameter.toLowerCase().split(' ') as TypesEnum[];

		if (lowerCasedSplitArguments.length > 2)
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Pokemon.TypeTooManyTypes });

		for (const type of lowerCasedSplitArguments) {
			if (!kPokemonTypes.has(type))
				return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Pokemon.TypeNotAType, context: { type } });
		}

		return Args.ok(lowerCasedSplitArguments);
	});
}
