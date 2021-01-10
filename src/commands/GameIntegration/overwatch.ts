import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { OverwatchDataSet, OverwatchStatsTypeUnion, PlatformUnion, TopHero } from '#lib/types/definitions/Overwatch';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { OverwatchEmbedDataReturn } from '#lib/types/namespaces/languages/commands/GameIntegration';
import { BrandingColors, Time } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Collection, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['ow'],
	cooldown: 10,
	description: LanguageKeys.Commands.GameIntegration.OverwatchDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.OverwatchExtended,
	usage: '<xbl|psn|pc:default> <player:...overwatchplayer>',
	usageDelim: ' '
})
export default class extends RichDisplayCommand {
	private readonly kPlayTimestamp = new Timestamp('H [hours] - m [minutes]');

	public async run(message: GuildMessage, [platform = 'pc', player]: [PlatformUnion, string]) {
		const t = await message.fetchT();

		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true }))).setColor(BrandingColors.Secondary)
		);

		const overwatchData = await this.fetchAPI(t, player, platform);

		if (overwatchData.error) throw t(LanguageKeys.System.QueryFail);
		if (!overwatchData.competitiveStats.topHeroes || !overwatchData.quickPlayStats.topHeroes) {
			throw t(LanguageKeys.Commands.GameIntegration.OverwatchNoStats, { player: this.decodePlayerName(player) });
		}

		const display = await this.buildDisplay(message, t, overwatchData, player, platform);
		await display.start(response, message.author.id);
		return response;
	}

	/** Queries the Overwatch API for data on a player with platform */
	private async fetchAPI(t: TFunction, player: string, platform: PlatformUnion) {
		try {
			return await fetch<OverwatchDataSet>(`https://ow-api.com/v1/stats/${platform}/global/${player}/complete`, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.Commands.GameIntegration.OverwatchQueryFail, {
				player: this.decodePlayerName(player),
				platform
			});
		}
	}

	/** Builds a UserRichDisplay for presenting Overwatch data */
	private async buildDisplay(message: GuildMessage, t: TFunction, overwatchData: OverwatchDataSet, player: string, platform: PlatformUnion) {
		const ratings = Array.from(
			this.ratingsToCollection(
				overwatchData.ratings ?? [],
				(r) => r.role,
				(r) => r
			)
				.mapValues((rating) => {
					return `**${toTitleCase(rating.role)}:** ${
						typeof rating.level === 'number' ? t(LanguageKeys.Globals.GroupDigitsValue, { value: rating.level }) : rating.level
					}`;
				})
				.values()
		).join('\n');

		const embedData = t(LanguageKeys.Commands.GameIntegration.OverwatchEmbedData, {
			authorName: overwatchData.name,
			playerLevel: overwatchData.level,
			prestigeLevel: overwatchData.level + overwatchData.prestige * 100,
			totalGamesWon: overwatchData.gamesWon,
			returnObjects: true
		});

		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(embedData.author, CdnUrls.OverwatchLogo)
				.setTitle(embedData.title)
				.setURL(`https://overwatchtracker.com/profile/${platform}/global/${player}`)
				.setThumbnail(overwatchData.icon)
		)
			.addPage((embed) =>
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
			.addPage((embed) => embed.setDescription(this.extractStats(t, overwatchData, 'quickPlayStats', embedData)))
			.addPage((embed) => embed.setDescription(this.extractStats(t, overwatchData, 'competitiveStats', embedData)))
			.addPage((embed) => embed.setDescription(this.extractTopHeroes(t, overwatchData, 'quickPlayStats', embedData)))
			.addPage((embed) => embed.setDescription(this.extractTopHeroes(t, overwatchData, 'competitiveStats', embedData)));
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

		const timePlayedMilliseconds = Number(timePlayed.split(':')[0]) * Time.Hour + Number(timePlayed.split(':')[1]) * Time.Minute;
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
			bronzeMedals: medalsBronze,
			returnObjects: true
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
					playTime: this.kPlayTimestamp.display(topHero.time)
				})
			)
		].join('\n');
	}

	private decodePlayerName(name: string) {
		return decodeURIComponent(name.replace('-', '#'));
	}
}
