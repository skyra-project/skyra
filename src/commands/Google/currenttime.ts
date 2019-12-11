import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { queryGoogleMapsAPI, handleNotOK } from '../../lib/util/Google';
import { fetch, FetchResultTypes, getColor } from '../../lib/util/util';
import { TOKENS } from '../../../config';
import { MessageEmbed } from 'discord.js';

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
		const [address, lat, lng] = await queryGoogleMapsAPI(message, this.client, location);
		const { status, ...timeData } = await this.fetchAPI(message, lat, lng);

		if (status !== 'OK') throw message.language.tget(handleNotOK(status, this.client));

		const TITLES = message.language.tget('COMMAND_CURRENTTIME_TITLES');
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(`:flag_${timeData.countryCode.toLowerCase()}: ${address}`)
			.setDescription([
				`**${TITLES.CURRENT_TIME}**: ${timeData.formatted.split(' ')[1]}`,
				`**${TITLES.CURRENT_DATE}**: ${timeData.formatted.split(' ')[0]}`,
				`**${TITLES.COUNTRY}**: ${timeData.countryName}`,
				`**${TITLES.GMT_OFFSET}**: ${message.language.duration(timeData.gmtOffset * 1000)}`,
				`${TITLES.DST(timeData.dst)}`
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
		return await fetch(url, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('COMMAND_CURRENTTIME_LOCATION_NOT_FOUND'); }) as TimeResult;
	}

}

export interface TimeResult {
	status: 'OK' | 'FAILED';
	message: '' | string;
	countryCode: string;
	countryName: string;
	zoneName: string;
	abbreviation: string;
	gmtOffset: number;
	dst: string;
	zoneStart: number;
	zoneEnd: number;
	timestamp: number;
	formatted: string;
	totalPage: number;
	currentPage: number;
}
