import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GoogleResponseCodes, handleNotOK, queryGoogleMapsAPI } from '#utils/APIs/Google';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import { URL } from 'url';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('GOOGLE_MAPS_API_TOKEN', 'TIMEZONEDB_TOKEN'),
	aliases: ['ctime'],
	description: LanguageKeys.Commands.Google.CurrentTimeDescription,
	extendedHelp: LanguageKeys.Commands.Google.CurrentTimeExtended,
	requiredClientPermissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const location = await args.rest('string');
		const { t } = args;
		const { formattedAddress, lat, lng } = await queryGoogleMapsAPI(message, location);
		const { status, ...timeData } = await this.fetchAPI(lat, lng);

		if (status !== GoogleResponseCodes.Ok) this.error(handleNotOK(status));

		const dstEnabled = t(
			Number(timeData.dst) === 0 ? LanguageKeys.Commands.Google.CurrentTimeDst : LanguageKeys.Commands.Google.CurrentTimeNoDst
		);

		const titles = t(LanguageKeys.Commands.Google.CurrentTimeTitles, { dst: dstEnabled });
		const description = [
			`**${titles.currentTime}**: ${timeData.formatted.split(' ')[1]}`,
			`**${titles.currentDate}**: ${timeData.formatted.split(' ')[0]}`,
			`**${titles.country}**: ${timeData.countryName}`,
			`**${titles.gmsOffset}**: ${t(LanguageKeys.Globals.DurationValue, { value: timeData.gmtOffset * 1000 })}`,
			`${titles.dst}`
		].join('\n');
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(`:flag_${timeData.countryCode.toLowerCase()}: ${formattedAddress}`)
			.setDescription(description);
		return send(message, { embeds: [embed] });
	}

	private async fetchAPI(lat: number, lng: number) {
		const url = new URL('http://api.timezonedb.com/v2.1/get-time-zone');
		url.searchParams.append('by', 'position');
		url.searchParams.append('format', 'json');
		url.searchParams.append('key', process.env.TIMEZONEDB_TOKEN);
		url.searchParams.append('lat', lat.toString());
		url.searchParams.append('lng', lng.toString());
		url.searchParams.append('fields', 'countryName,countryCode,formatted,dst,gmtOffset');
		return fetch<TimeResult>(url, FetchResultTypes.JSON).catch(() => {
			this.error(LanguageKeys.Commands.Google.CurrentTimeLocationNotFound);
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
