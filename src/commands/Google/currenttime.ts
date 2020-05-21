import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { TOKENS } from '@root/config';
import { GoogleResponseCodes, handleNotOK, queryGoogleMapsAPI } from '@utils/Google';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ctime'],
			cooldown: 10,
			description: language => language.tget('COMMAND_CURRENTTIME_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CURRENTTIME_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<location:string>'
		});
	}

	public async run(message: KlasaMessage, [location]: [string]) {
		const { formattedAddress, lat, lng } = await queryGoogleMapsAPI(message, location);
		const { status, ...timeData } = await this.fetchAPI(message, lat, lng);

		if (status !== GoogleResponseCodes.Ok) throw message.language.tget(handleNotOK(status, this.client));

		const TITLES = message.language.tget('COMMAND_CURRENTTIME_TITLES');
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(`:flag_${timeData.countryCode.toLowerCase()}: ${formattedAddress}`)
			.setDescription([
				`**${TITLES.CURRENT_TIME}**: ${timeData.formatted.split(' ')[1]}`,
				`**${TITLES.CURRENT_DATE}**: ${timeData.formatted.split(' ')[0]}`,
				`**${TITLES.COUNTRY}**: ${timeData.countryName}`,
				`**${TITLES.GMT_OFFSET}**: ${message.language.duration(timeData.gmtOffset * 1000)}`,
				`${TITLES.DST(Number(timeData.dst))}`
			].join('\n')));
	}

	private async fetchAPI(message: KlasaMessage, lat: number, lng: number) {
		const url = new URL('http://api.timezonedb.com/v2.1/get-time-zone');
		url.searchParams.append('by', 'position');
		url.searchParams.append('format', 'json');
		url.searchParams.append('key', TOKENS.TIMEZONEDB_KEY);
		url.searchParams.append('lat', lat.toString());
		url.searchParams.append('lng', lng.toString());
		url.searchParams.append('fields', 'countryName,countryCode,formatted,dst,gmtOffset');
		return fetch<TimeResult>(url, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('COMMAND_CURRENTTIME_LOCATION_NOT_FOUND'); });
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
