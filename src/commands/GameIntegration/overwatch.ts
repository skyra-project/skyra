import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { OverwatchEmbedDataReturn } from '#lib/i18n/languageKeys/keys/commands/GameIntegration';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import type { OverwatchDataSet, OverwatchStatsTypeUnion, PlatformUnion, TopHero } from '#lib/types/definitions/Overwatch';
import { Time } from '#utils/constants';
import { fetch, FetchResultTypes, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, IArgument } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Collection, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const VALID_PLATFORMS: PlatformUnion[] = ['xbl', 'psn', 'pc'];

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['ow'],
	cooldown: 10,
	description: LanguageKeys.Commands.GameIntegration.OverwatchDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.OverwatchExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const platform = await args.pick(UserPaginatedMessageCommand.platformResolver).catch(() => 'pc' as const);
		const player = await args.rest('overwatchPlayer');
		const response = await sendLoadingMessage(message, args.t);

		const overwatchData = await this.fetchAPI(player, platform);

		if (overwatchData.error) this.error(LanguageKeys.System.QueryFail);
		if (!overwatchData.competitiveStats.topHeroes || !overwatchData.quickPlayStats.topHeroes) {
			this.error(LanguageKeys.Commands.GameIntegration.OverwatchNoStats, { player: this.decodePlayerName(player) });
		}

		const display = await this.buildDisplay(message, args.t, overwatchData, player, platform);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	/** Queries the Overwatch API for data on a player with platform */
	private async fetchAPI(player: string, platform: PlatformUnion) {
		try {
			return await fetch<OverwatchDataSet>(`https://ow-api.com/v1/stats/${platform}/global/${player}/complete`, FetchResultTypes.JSON);
		} catch {
			this.error(LanguageKeys.Commands.GameIntegration.OverwatchQueryFail, {
				player: this.decodePlayerName(player),
				platform
			});
		}
	}

	/** Builds a PaginatedMessage for presenting Overwatch data */
	private async buildDisplay(message: GuildMessage, t: TFunction, overwatchData: OverwatchDataSet, player: string, platform: PlatformUnion) {
		const ratings = Array.from(
			this.ratingsToCollection(
				overwatchData.ratings ?? [],
				(r) => r.role,
				(r) => r
			)
				.mapValues((rating) => {
					return `**${toTitleCase(rating.role)}:** ${
						typeof rating.level === 'number' ? t(LanguageKeys.Globals.NumberValue, { value: rating.level }) : rating.level
					}`;
				})
				.values()
		).join('\n');

		const embedData = t(LanguageKeys.Commands.GameIntegration.OverwatchEmbedData, {
			authorName: overwatchData.name,
			playerLevel: overwatchData.level,
			prestigeLevel: overwatchData.level + overwatchData.prestige * 100,
			totalGamesWon: overwatchData.gamesWon
		});

		return new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(embedData.author, CdnUrls.OverwatchLogo)
				.setTitle(embedData.title)
				.setURL(`https://overwatchtracker.com/profile/${platform}/global/${player}`)
				.setThumbnail(overwatchData.icon)
		})
			.addPageEmbed((embed) =>
				embed
					.setDescription(
						[
							embedData.headers.account,
							embedData.playerLevel,
							embedData.prestigeLevel,
							overwatchData.gamesWon ? embedData.totalGamesWon : embedData.noGamesWon
						].join('\n')
					)
					.addField(embedData.ratingsTitle, ratings || t(LanguageKeys.Globals.None))
			)
			.addPageEmbed((embed) => embed.setDescription(this.extractStats(t, overwatchData, 'quickPlayStats', embedData)))
			.addPageEmbed((embed) => embed.setDescription(this.extractStats(t, overwatchData, 'competitiveStats', embedData)))
			.addPageEmbed((embed) => embed.setDescription(this.extractTopHeroes(t, overwatchData, 'quickPlayStats', embedData)))
			.addPageEmbed((embed) => embed.setDescription(this.extractTopHeroes(t, overwatchData, 'competitiveStats', embedData)));
	}

	/**
	 * Creates a `Map` using the `keyExtractor` and `valueExtractor` to obtain the key and value of each element
	 * in an `Array` of `object`s
	 * @remark If multiple elements have the same `key` then only the last element with that `key` will be included
	 * @param inputArray The array of objects to transform into a Map
	 * @param keyExtractor A function that describes where to find the `key` for the `Map`
	 * @param valueExtractor A function that describes where to find the `value` for the `Map`
	 * @returns a `Map<Key, Value>` of the values, mapped by the given key
	 */
	private ratingsToCollection<I, K, V>(inputArray: readonly I[], keyExtractor: (_: I) => K, valueExtractor: (_: I) => V): Collection<K, V> {
		return inputArray.reduce<Collection<K, V>>(
			(accumulator: Collection<K, V>, element: I) => accumulator.set(keyExtractor(element), valueExtractor(element)),
			new Collection<K, V>()
		);
	}

	/** Retrieves the top 5 heroes (name and time played in milliseconds) for either `competitiveStats` or `quickPlayStats` */
	private getTopHeroes(overwatchData: OverwatchDataSet, type: OverwatchStatsTypeUnion): TopHero[] {
		const overwatchDataType = overwatchData[type];

		return Object.keys(overwatchDataType.topHeroes)
			.map((hero) => {
				const timePlayed = overwatchDataType.topHeroes[hero].timePlayed.split(':').map(parseFloat);
				const seconds =
					timePlayed.length === 3
						? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
						: Number(timePlayed[0] * 60) + Number(timePlayed[1]);

				return { hero, time: seconds * Time.Second };
			})
			.sort((a, b) => b.time - a.time)
			.slice(0, 5);
	}

	/** Extracts statistics from overwatchData for either competitive play or quickplay and returns it in a format valid for `MessageEmbed` description */
	private extractStats(t: TFunction, overwatchData: OverwatchDataSet, type: OverwatchStatsTypeUnion, embedData: OverwatchEmbedDataReturn) {
		const {
			careerStats: {
				allHeroes: {
					combat: { finalBlows, deaths, damageDone, objectiveKills, soloKills },
					assists: { healingDone },
					game: { timePlayed }
				}
			},
			games: { won: gamesWon },
			awards: { medalsBronze, medalsSilver, medalsGold }
		} = overwatchData[type];

		const [hours, minutes] = timePlayed.split(':');
		const timePlayedMilliseconds = Number(hours) * Time.Hour + Number(minutes) * Time.Minute;
		const statsData = t(LanguageKeys.Commands.GameIntegration.OverwatchEmbedDataStats, {
			finalBlows,
			deaths,
			damageDone,
			healing: healingDone,
			objectiveKills,
			soloKills,
			playTime: timePlayedMilliseconds,
			gamesWon,
			goldenMedals: medalsGold,
			silverMedals: medalsSilver,
			bronzeMedals: medalsBronze
		});

		return [
			embedData.headers[type === 'competitiveStats' ? 'competitive' : 'quickplay'],
			statsData.finalBlows,
			statsData.deaths,
			statsData.damageDealt,
			statsData.healing,
			statsData.objectiveKills,
			statsData.soloKills,
			statsData.playTime,
			statsData.gamesWon,
			statsData.goldenMedals,
			statsData.silverMedals,
			statsData.bronzeMedals
		].join('\n');
	}

	/** Extracts top heroes from overwatchData for either competitive play or quickplay and returns it in a format valid for `MessageEmbed` description */
	private extractTopHeroes(t: TFunction, overwatchData: OverwatchDataSet, type: OverwatchStatsTypeUnion, embedData: OverwatchEmbedDataReturn) {
		const topHeroes = this.getTopHeroes(overwatchData, type);

		return [
			embedData.headers[type === 'competitiveStats' ? 'topHeroesCompetitive' : 'topHeroesQuickplay'],
			...topHeroes.map((topHero) =>
				t(LanguageKeys.Commands.GameIntegration.OverwatchEmbedDataTopHero, {
					name: topHero.hero,
					playTime: topHero.time
				})
			)
		].join('\n');
	}

	private decodePlayerName(name: string) {
		return decodeURIComponent(name.replace('-', '#'));
	}

	private static platformResolver: IArgument<PlatformUnion> = Args.make((parameter, { argument }) => {
		if (VALID_PLATFORMS.includes(parameter.toLowerCase() as PlatformUnion)) return Args.ok(parameter.toLowerCase() as PlatformUnion);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlatform });
	});
}
