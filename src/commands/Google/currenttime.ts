import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { TOKENS } from '#root/config';
import { GoogleResponseCodes, handleNotOK, queryGoogleMapsAPI } from '#utils/APIs/Google';
import { fetch, FetchResultTypes } from '#utils/util';
import { Message, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ctime'],
			cooldown: 10,
			description: LanguageKeys.Commands.Google.CurrentTimeDescription,
			extendedHelp: LanguageKeys.Commands.Google.CurrentTimeExtended,
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<location:string>'
		});
	}

	public async run(message: Message, [location]: [string]) {
		const { formattedAddress, lat, lng } = await queryGoogleMapsAPI(message, location);
		const t = await message.fetchT();
		const { status, ...timeData } = await this.fetchAPI(t, lat, lng);

		if (status !== GoogleResponseCodes.Ok) throw t(handleNotOK(status, this.client));

		const dstEnabled = t(
			Number(timeData.dst) === 0 ? LanguageKeys.Commands.Google.CurrentTimeDst : LanguageKeys.Commands.Google.CurrentTimeNoDst
		);

		const titles = t(LanguageKeys.Commands.Google.CurrentTimeTitles, { dst: dstEnabled });
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(`:flag_${timeData.countryCode.toLowerCase()}: ${formattedAddress}`)
				.setDescription(
					[
						`**${titles.currentTime}**: ${timeData.formatted.split(' ')[1]}`,
						`**${titles.currentDate}**: ${timeData.formatted.split(' ')[0]}`,
						`**${titles.country}**: ${timeData.countryName}`,
						`**${titles.gmsOffset}**: ${t(LanguageKeys.Globals.DurationValue, { value: timeData.gmtOffset * 1000 })}`,
						`${titles.dst}`
					].join('\n')
				)
		);
	}

	private async fetchAPI(t: TFunction, lat: number, lng: number) {
		const url = new URL('http://api.timezonedb.com/v2.1/get-time-zone');
		url.searchParams.append('by', 'position');
		url.searchParams.append('format', 'json');
		url.searchParams.append('key', TOKENS.TIMEZONEDB_KEY);
		url.searchParams.append('lat', lat.toString());
		url.searchParams.append('lng', lng.toString());
		url.searchParams.append('fields', 'countryName,countryCode,formatted,dst,gmtOffset');
		return fetch<TimeResult>(url, FetchResultTypes.JSON).catch(() => {
			throw t(LanguageKeys.Commands.Google.CurrentTimeLocationNotFound);
		});
	}
}

/** API Response from TimezoneDB */
export interface TimeResult {
	/** Status of the API query. Either OK or FAILED. */
	status: GoogleResponseCodes;
	/** Error message. Empty if no error. */
	message: '' | string;
	/** Country code of the time zone. */
	countryCode: string;
	/** Country name of the time zone. */
	countryName: string;
	/** The time zone name. */
	zoneName: string;
	/** Abbreviation of the time zone. */
	abbreviation: string;
	/** The time offset in seconds based on UTC time. */
	gmtOffset: number;
	/** Whether Daylight Saving Time (DST) is used. Either 0 (No) or 1 (Yes). */
	dst: string;
	/** The Unix time in UTC when current time zone start. */
	zoneStart: number;
	/** The Unix time in UTC when current time zone end. */
	zoneEnd: number;
	/** Current local time in Unix time. Minus the value with gmtOffset to get UTC time. */
	timestamp: number;
	/** Formatted timestamp in Y-m-d h:i:s format. E.g.: 2019-12-11 21:41:12 */
	formatted: string;
	/** The total page of result when exceed 25 records. */
	totalPage: number;
	/** Current page when navigating. */
	currentPage: number;
}
