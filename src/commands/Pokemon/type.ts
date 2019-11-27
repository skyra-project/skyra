import { TypeEntry, Types as string } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getTypeMatchup, GraphQLPokemonResponse, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL, POKEMON_GRAPHQL_API_URL } from '../../lib/util/Pokemon';
import { fetch, FetchResultTypes, getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_TYPE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TYPE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<types:type{2}>'
		});

		this.createCustomResolver('type', (arg: string | string[], _, message) => {
			arg = (arg as string).toLowerCase().split(' ');

			if (arg.length > 2) throw message.language.tget('COMMAND_TYPE_TOO_MANY_TYPES');

			for (const type of arg) {
				if (!(toTitleCase(type) in string)) return message.language.tget('COMMAND_TYPE_NOT_A_TYPE', type);
			}

			return arg;
		});
	}

	public async run(message: KlasaMessage, [types]: [string[]]) {
		try {
			const { getTypeMatchup: typeMatchups } = (await this.fetchAPI(message, types)).data;

			const embedTranslations = message.language.tget('COMMAND_TYPE_EMBED_DATA');
			return message.sendEmbed(new MessageEmbed()
				.setColor(getColor(message))
				.setAuthor(`${embedTranslations.TYPE_EFFECTIVENESS_FOR(types)}`, POKEMON_EMBED_THUMBNAIL)
				.addField(`__${embedTranslations.OFFENSIVE}__`, [
					`${embedTranslations.SUPER_EFFECTIVE_AGAINST}: ${this.parseEffectiveMatchup(typeMatchups.attacking.doubleEffectiveTypes, typeMatchups.attacking.effectiveTypes)}`,
					'',
					`${embedTranslations.DEALS_NORMAL_DAMAGE_TO}: ${this.parseRegularMatchup(typeMatchups.attacking.normalTypes)}`,
					'',
					`${embedTranslations.NOT_VERY_EFFECTIVE_AGAINST}: ${this.parseResistedMatchup(typeMatchups.attacking.doubleResistedTypes, typeMatchups.attacking.resistedTypes)}`,
					'',
					`${typeMatchups.attacking.effectlessTypes.length ? `${embedTranslations.DOES_NOT_AFFECT}: ${this.parseRegularMatchup(typeMatchups.attacking.effectlessTypes)}` : ''}`
				].join('\n'))
				.addField(`__${embedTranslations.DEFENSIVE}__`, [
					`${embedTranslations.VULNERABLE_TO}: ${this.parseEffectiveMatchup(typeMatchups.defending.doubleEffectiveTypes, typeMatchups.defending.effectiveTypes)}`,
					'',
					`${embedTranslations.TAKES_NORMAL_DAMAGE_FROM}: ${this.parseRegularMatchup(typeMatchups.defending.normalTypes)}`,
					'',
					`${embedTranslations.RESISTS}: ${this.parseResistedMatchup(typeMatchups.defending.doubleResistedTypes, typeMatchups.defending.resistedTypes)}`,
					'',
					`${typeMatchups.defending.effectlessTypes.length ? `${embedTranslations.NOT_AFFECTED_BY}: ${this.parseRegularMatchup(typeMatchups.defending.effectlessTypes)}` : ''}`
				].join('\n'))
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(`https://bulbapedia.bulbagarden.net/wiki/${types[0]}_(type)`)} )`,
					`[Serebii](https://www.serebii.net/pokedex-sm/${types[0].toLowerCase()}.shtml)`,
					`[Smogon](http://www.smogon.com/dex/sm/types/${types[0]})`
				].join(' | ')));
		} catch (err) {
			this.client.console.error(err);
			throw message.language.tget('COMMAND_TYPE_QUERY_FAIL', types);
		}
	}

	private async fetchAPI(message: KlasaMessage, types: string[]) {
		return fetch(POKEMON_GRAPHQL_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: getTypeMatchup(types)
			})
		}, FetchResultTypes.JSON)
			.catch(err => {
				this.client.console.error(err);
				throw message.language.tget('SYSTEM_QUERY_FAIL');
			}) as Promise<GraphQLPokemonResponse<'getTypeMatchup'>>;
	}

	private parseEffectiveMatchup(doubleEffectiveTypes: TypeEntry['doubleEffectiveTypes'], effectiveTypes: TypeEntry['effectiveTypes']) {
		return doubleEffectiveTypes
			.map(type => `${type} (x4)`)
			.concat(effectiveTypes.map(type => `${type} (x2)`))
			.map(type => `\`${type}\``)
			.join(', ');
	}

	private parseResistedMatchup(doubleResistedTypes: TypeEntry['doubleResistedTypes'], resistedTypes: TypeEntry['resistedTypes']) {
		return doubleResistedTypes
			.map(type => `${type} (x0.25)`)
			.concat(resistedTypes.map(type => `${type} (x0.5)`))
			.map(type => `\`${type}\``)
			.join(', ');
	}

	private parseRegularMatchup(regularMatchup: TypeEntry['normalTypes'] | TypeEntry['effectlessTypes']) {
		return regularMatchup.map(type => `\`${type}\``).join(', ');
	}

}
