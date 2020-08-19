import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { OverwatchDataSet, OverwatchStatsTypeUnion, PlatformUnion, TopHero } from '@lib/types/definitions/Overwatch';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Time } from '@utils/constants';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, LanguageKeys, Timestamp } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['ow'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_OVERWATCH_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_OVERWATCH_EXTENDED'),
	usage: '<xbl|psn|pc:default> <player:...overwatchplayer>',
	usageDelim: ' '
})
export default class extends RichDisplayCommand {
	private readonly kPlayTimestamp = new Timestamp('H [hours] - m [minutes]');

	public async run(message: KlasaMessage, [platform = 'pc', player]: [PlatformUnion, string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);

		const overwatchData = await this.fetchAPI(message, player, platform);

		if (overwatchData.error) throw message.language.get('SYSTEM_QUERY_FAIL');
		if (!overwatchData.competitiveStats.topHeroes || !overwatchData.quickPlayStats.topHeroes) {
			throw message.language.get('COMMAND_OVERWATCH_NO_STATS', { player: this.decodePlayerName(player) });
		}

		const display = await this.buildDisplay(message, overwatchData, player, platform);
		await display.start(response, message.author.id);
		return response;
	}

	/** Queries the Overwatch API for data on a player with platform */
	private async fetchAPI(message: KlasaMessage, player: string, platform: PlatformUnion) {
		try {
			return await fetch<OverwatchDataSet>(`https://ow-api.com/v1/stats/${platform}/global/${player}/complete`, FetchResultTypes.JSON);
		} catch {
			throw message.language.get('COMMAND_OVERWATCH_QUERY_FAIL', { player: this.decodePlayerName(player), platform });
		}
	}

	/** Builds a UserRichDisplay for presenting Overwatch data */
	private async buildDisplay(message: KlasaMessage, overwatchData: OverwatchDataSet, player: string, platform: PlatformUnion) {
		const ratings = this.ratingsToMap(
			overwatchData.ratings ?? [],
			(r) => r.role,
			(r) => r
		);
		const EMBED_DATA = message.language.get('COMMMAND_OVERWATCH_EMBED_DATA', {
			authorName: overwatchData.name,
			playerLevel: overwatchData.level,
			prestigeLevel: overwatchData.level + overwatchData.prestige * 100,
			totalGamesWon: overwatchData.gamesWon,
			ratings: [
				...ratings.values(),
				{ role: 'average', level: overwatchData.rating === 0 ? message.language.get('COMMAND_OVERWATCH_NO_AVERAGE') : overwatchData.rating }
			]
		});

		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(EMBED_DATA.AUTHOR, CdnUrls.OverwatchLogo)
				.setTitle(EMBED_DATA.TITLE)
				.setURL(`https://overwatchtracker.com/profile/${platform}/global/${player}`)
				.setThumbnail(overwatchData.icon)
		)
			.addPage((embed: MessageEmbed) =>
				embed
					.setDescription(
						[EMBED_DATA.HEADERS.ACCOUNT, EMBED_DATA.PLAYER_LEVEL, EMBED_DATA.PRESTIGE_LEVEL, EMBED_DATA.TOTAL_GAMES_WON].join('\n')
					)
					.addField(EMBED_DATA.RATINGS_TITLE, EMBED_DATA.RATINGS)
			)
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractStats(message, overwatchData, 'quickPlayStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractStats(message, overwatchData, 'competitiveStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractTopHeroes(message, overwatchData, 'quickPlayStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractTopHeroes(message, overwatchData, 'competitiveStats', EMBED_DATA)));
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
	private ratingsToMap<I, K, V>(inputArray: readonly I[], keyExtractor: (_: I) => K, valueExtractor: (_: I) => V): Map<K, V> {
		return inputArray.reduce<Map<K, V>>(
			(accumulator: Map<K, V>, element: I) => accumulator.set(keyExtractor(element), valueExtractor(element)),
			new Map<K, V>()
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
	private extractStats(
		message: KlasaMessage,
		overwatchData: OverwatchDataSet,
		type: OverwatchStatsTypeUnion,
		EMBED_DATA: ReturnType<LanguageKeys['COMMMAND_OVERWATCH_EMBED_DATA']>
	) {
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
		const STATS_DATA = message.language.get('COMMAND_OVERWATCH_EMBED_DATA_STATS', {
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
			EMBED_DATA.HEADERS[type === 'competitiveStats' ? 'COMPETITIVE' : 'QUICKPLAY'],
			STATS_DATA.FINAL_BLOWS,
			STATS_DATA.DEATHS,
			STATS_DATA.DAMAGE_DEALT,
			STATS_DATA.HEALING,
			STATS_DATA.OBJECTIVE_KILLS,
			STATS_DATA.SOLO_KILLS,
			STATS_DATA.PLAY_TIME,
			STATS_DATA.GAMES_WON,
			STATS_DATA.GOLDEN_MEDALS,
			STATS_DATA.SILVER_MEDALS,
			STATS_DATA.BRONZE_MEDALS
		].join('\n');
	}

	/** Extracts top heroes from overwatchData for either competitive play or quickplay and returns it in a format valid for `MessageEmbed` description */
	private extractTopHeroes(
		message: KlasaMessage,
		overwatchData: OverwatchDataSet,
		type: OverwatchStatsTypeUnion,
		EMBED_DATA: ReturnType<LanguageKeys['COMMMAND_OVERWATCH_EMBED_DATA']>
	) {
		const topHeroes = this.getTopHeroes(overwatchData, type);

		return [
			EMBED_DATA.HEADERS[type === 'competitiveStats' ? 'TOP_HEROES_COMPETITIVE' : 'TOP_HEROES_QUICKPLAY'],
			...topHeroes.map((topHero) =>
				message.language.get('COMMAND_OVERWATCH_EMBED_DATA_TOP_HERO', {
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
