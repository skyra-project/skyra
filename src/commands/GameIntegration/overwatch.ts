import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { OverwatchDataSet, PlatformUnion, TopHero } from '@lib/types/definitions/Overwatch';
import { LanguageKeys } from '@lib/types/Languages';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Time } from '@utils/constants';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Timestamp } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['ow'],
	cooldown: 10,
	description: language => language.tget('COMMAND_OVERWATCH_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_OVERWATCH_EXTENDED'),
	requiredGuildPermissions: ['EMBED_LINKS'],
	usage: '<xbl|psn|pc:default> <player:...overwatchplayer>',
	usageDelim: ' '
})
export default class OverwatchCommand extends SkyraCommand {

	private kPlayTimestamp = new Timestamp('H [hours] - m [minutes]');
	private kAuthorThumbnail = 'https://cdn.skyra.pw/img/overwatch/logo.png';
	private kRemoveNullAndUndefined = this.removeNullAndUndefined.bind(this);

	public async run(message: KlasaMessage, [platform = 'pc', player]: [PlatformUnion, string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const overwatchData = await this.fetchAPI(message, player, platform);

		if (overwatchData.error) throw message.language.tget('SYSTEM_QUERY_FAIL');
		if (!overwatchData.competitiveStats.topHeroes || !overwatchData.quickPlayStats.topHeroes) {
			throw message.language.tget('COMMAND_OVERWATCH_NO_STATS', this.decodePlayerName(player));
		}

		await this.buildDisplay(message, overwatchData, player, platform).start(response, message.author.id);
		return response;
	}

	/** Queries the Overwatch API for data on a player with platform */
	private async fetchAPI(message: KlasaMessage, player: string, platform: PlatformUnion) {
		return fetch(`https://ow-api.com/v1/stats/${platform}/global/${player}/complete`, FetchResultTypes.JSON)
			.catch(() => {
				throw message.language.tget('COMMAND_OVERWATCH_QUERY_FAIL', this.decodePlayerName(player), platform);
			}) as Promise<OverwatchDataSet>;
	}

	/** Builds a UserRichDisplay for presenting Overwatch data */
	private buildDisplay(
		message: KlasaMessage,
		overwatchData: OverwatchDataSet,
		player: string,
		platform: PlatformUnion
	) {
		const EMBED_DATA = message.language.tget('COMMMAND_OVERWATCH_EMBED_DATA');
		const ratings = this.ratingsToMap(overwatchData.ratings, r => r.role, r => r);

		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(getColor(message))
				.setAuthor(EMBED_DATA.AUTHOR(overwatchData.name), this.kAuthorThumbnail)
				.setTitle(EMBED_DATA.TITLE)
				.setURL(`https://overwatchtracker.com/profile/${platform}/global/${player}`)
				.setThumbnail(overwatchData.icon)
		)
			.addPage((embed: MessageEmbed) => embed
				.setDescription([
					EMBED_DATA.HEADERS.ACCOUNT,
					EMBED_DATA.PLAYER_LEVEL(overwatchData.level),
					EMBED_DATA.PRESTIGE_LEVEL(overwatchData.level + (overwatchData.prestige * 100)),
					EMBED_DATA.TOTAL_GAMES_WON(overwatchData.gamesWon)
				].join('\n'))
				.addField(EMBED_DATA.RATINGS_TITLE, EMBED_DATA.RATINGS([
					{ role: ratings.get('damage')!.role, level: ratings.get('damage')!.level },
					{ role: ratings.get('support')!.role, level: ratings.get('support')!.level },
					{ role: ratings.get('tank')!.role, level: ratings.get('tank')!.level },
					{ role: 'average', level: overwatchData.rating }
				])))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractStats(overwatchData, 'quickPlayStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractStats(overwatchData, 'competitiveStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractTopHeroes(overwatchData, 'quickPlayStats', EMBED_DATA)))
			.addPage((embed: MessageEmbed) => embed.setDescription(this.extractTopHeroes(overwatchData, 'competitiveStats', EMBED_DATA)));
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
	private ratingsToMap<I, K, V>(inputArray: I[], keyExtractor: (_: I) => K, valueExtractor: (_: I) => V): Map<K, V> {
		return inputArray.reduce<Map<K, V>>((accumulator: Map<K, V>, element: I) => accumulator.set(keyExtractor(element), valueExtractor(element)), new Map<K, V>());
	}

	/** Retrieves the top 5 heroes (name and time played in milliseconds) for either `competitiveStats` or `quickPlayStats` */
	private getTopHeroes(overwatchData: OverwatchDataSet, type: 'competitiveStats' | 'quickPlayStats'): TopHero[] {
		return Object.keys(overwatchData[type].topHeroes)
			.map(hero => {
				if (Reflect.has(overwatchData[type].topHeroes, hero)) {
					const timePlayed = overwatchData[type].topHeroes[hero].timePlayed.split(':').map(parseFloat);
					const seconds = timePlayed.length === 3
						? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
						: Number(timePlayed[0] * 60) + Number(timePlayed[1]);

					return { hero, time: seconds * Time.Second };
				}

				return undefined;
			})
			.filter(this.kRemoveNullAndUndefined)
			.sort((a, b) => b.time - a.time)
			.slice(0, 5);
	}

	/** Removes `null` and `undefined` from an array in a TypeScript-safe way */
	private removeNullAndUndefined<TValue>(value: TValue | null | undefined): value is TValue {
		return value !== null && value !== undefined;
	}

	/** Extracts statistics from overwatchData for either competitive play or quickplay and returns it in a format valid for `MessageEmbed` description */
	private extractStats(overwatchData: OverwatchDataSet, type: 'competitiveStats' | 'quickPlayStats', EMBED_DATA: LanguageKeys['COMMMAND_OVERWATCH_EMBED_DATA']) {
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

		const timePlayedMilliseconds = (Number(timePlayed.split(':')[0]) * Time.Hour) + (Number(timePlayed.split(':')[1]) * Time.Minute);

		return [
			EMBED_DATA.HEADERS[type === 'competitiveStats' ? 'COMPETITIVE' : 'QUICKPLAY'],
			EMBED_DATA.FINAL_BLOWS(finalBlows),
			EMBED_DATA.DEATHS(deaths),
			EMBED_DATA.DAMAGE_DEALT(damageDone),
			EMBED_DATA.HEALING(healingDone),
			EMBED_DATA.OBJECTIVE_KILLS(objectiveKills),
			EMBED_DATA.SOLO_KILLS(soloKills),
			EMBED_DATA.PLAY_TIME(timePlayedMilliseconds),
			EMBED_DATA.GAMES_WON(gamesWon),
			EMBED_DATA.GOLDEN_MEDALS(medalsGold),
			EMBED_DATA.SILVER_MEDALS(medalsSilver),
			EMBED_DATA.BRONZE_MEDALS(medalsBronze)
		].join('\n');
	}

	/** Extracts top heroes from overwatchData for either competitive play or quickplay and returns it in a format valid for `MessageEmbed` description */
	private extractTopHeroes(overwatchData: OverwatchDataSet, type: 'competitiveStats' | 'quickPlayStats', EMBED_DATA: LanguageKeys['COMMMAND_OVERWATCH_EMBED_DATA']) {
		const topHeroes = this.getTopHeroes(overwatchData, type);

		return [
			EMBED_DATA.HEADERS[type === 'competitiveStats' ? 'TOP_HEROES_COMPETITIVE' : 'TOP_HEROES_QUICKPLAY'],
			...topHeroes.map(topHero => EMBED_DATA.TOP_HERO(topHero.hero, this.kPlayTimestamp.display(topHero.time)))
		].join('\n');
	}

	private decodePlayerName(name: string) {
		return decodeURIComponent(name.replace('-', '#'));
	}

}
