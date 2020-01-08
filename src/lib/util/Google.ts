import { Events } from '@lib/types/Enums';
import { TOKENS } from '@root/config';
import { Client, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { fetch, FetchResultTypes } from './util';

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_CUSTOM_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

export const enum CUSTOM_SEARCH_TYPE {
	IMAGE, SEARCH
}

export const enum GOOGLE_RESPONSE_CODES {
	ZERO_RESULTS = 'ZERO_RESULTS',
	REQUEST_DENIED = 'REQUEST_DENIED',
	INVALID_REQUEST = 'INVALID_REQUEST',
	OVER_QUERY_LIMIT= 'OVER_QUERY_LIMIT',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	OK = 'OK',
	FAILED = 'FAILED'
}

export async function queryGoogleMapsAPI(message: KlasaMessage, location: string) {
	const url = new URL(GOOGLE_MAPS_API_URL);
	url.searchParams.append('address', location);
	url.searchParams.append('key', TOKENS.GOOGLE_MAPS_API_KEY);
	const { results, status } = await fetch(url, FetchResultTypes.JSON) as GoogleMapsResultOk;

	if (status !== GOOGLE_RESPONSE_CODES.OK) throw message.language.tget(handleNotOK(status, message.client));
	if (results.length === 0) throw message.language.tget('GOOGLE_ERROR_ZERO_RESULTS');

	return {
		formattedAddress: results[0].formatted_address,
		lat: results[0].geometry.location.lat,
		lng: results[0].geometry.location.lng,
		addressComponents: results[0].address_components
	};
}

export async function queryGoogleCustomSearchAPI<T extends CUSTOM_SEARCH_TYPE>(message: KlasaMessage, type: T, query: string) {
	try {
		const nsfwAllowed = message.channel.type === 'text' ? (message.channel as TextChannel).nsfw : true;
		const url = new URL(GOOGLE_CUSTOM_SEARCH_API_URL);
		url.searchParams.append('cx', type === CUSTOM_SEARCH_TYPE.SEARCH ? TOKENS.GOOGLE_CUSTOM_SEARCH_WEB_KEY : TOKENS.GOOGLE_CUSTOM_SEARCH_IMAGE_KEY);
		url.searchParams.append('key', TOKENS.GOOGLE_API_KEY);
		url.searchParams.append('q', query);
		url.searchParams.append('safe', nsfwAllowed ? 'off' : 'active');
		if (type === CUSTOM_SEARCH_TYPE.IMAGE) url.searchParams.append('searchType', 'image');

		return await fetch(url, FetchResultTypes.JSON) as GoogleSearchResult<T>;
	} catch {
		throw message.language.tget(handleNotOK(GOOGLE_RESPONSE_CODES.UNKNOWN_ERROR, message.client));
	}
}

export function handleNotOK(status: GOOGLE_RESPONSE_CODES, client: Client) {
	switch (status) {
		case GOOGLE_RESPONSE_CODES.ZERO_RESULTS:
			return 'GOOGLE_ERROR_ZERO_RESULTS';
		case GOOGLE_RESPONSE_CODES.REQUEST_DENIED:
			return 'GOOGLE_ERROR_REQUEST_DENIED';
		case GOOGLE_RESPONSE_CODES.INVALID_REQUEST:
			return 'GOOGLE_ERROR_INVALID_REQUEST';
		case GOOGLE_RESPONSE_CODES.OVER_QUERY_LIMIT:
			return 'GOOGLE_ERROR_OVER_QUERY_LIMIT';
		default:
			client.emit(Events.Wtf, `Google::handleNotOK | Unknown Error: ${status}`);
			return 'GOOGLE_ERROR_UNKNOWN';
	}
}

export interface GoogleMapsResultOk {
	results: GoogleMapsResultOkResult[];
	status: GOOGLE_RESPONSE_CODES;
}

export interface GoogleMapsResultOkResult {
	address_components: GoogleMapsOkAddressComponent[];
	formatted_address: string;
	geometry: GoogleMapsOkGeometry;
	place_id: string;
	types: string[];
}

export interface GoogleMapsOkAddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

export interface GoogleMapsOkGeometry {
	bounds: GoogleMapsOkBounds;
	location: GoogleMapsOkLocation;
	location_type: string;
	viewport: GoogleMapsOkBounds;
}

export interface GoogleMapsOkBounds {
	northeast: GoogleMapsOkLocation;
	southwest: GoogleMapsOkLocation;
}

export interface GoogleMapsOkLocation {
	lat: number;
	lng: number;
}


export interface GoogleSearchResult<T extends CUSTOM_SEARCH_TYPE> {
	kind: string;
	context: { title: string };
	items: T extends CUSTOM_SEARCH_TYPE.IMAGE ? GoogleCSEImageData[] : GooleCSEItem[];
}

export interface GoogleCSEImageData {
	displayLink: string;
	htmlSnippet: string;
	htmlTitle: string;
	kind: string;
	link: string;
	mime: string;
	snippet: string;
	title: string;
	image: GoogleImage;
}

export interface GooleCSEItem {
	cacheId: string;
	displayLink: string;
	formattedUrl: string;
	htmlFormattedUrl: string;
	htmlSnippet: string;
	htmlTitle: string;
	kind: string;
	link: string;
	snippet: string;
	title: string;
	pagemap: {
		cse_image?: GoogleCSEImage[];
		cse_thumbnail: GoogleCSEImage[];
	};
}

interface GoogleCSEImage {
	src: string;
	height?: string;
	width?: string;
}

interface GoogleImage {
	byteSize: number;
	contextLink: string;
	height: number;
	thumbnailHeight: number;
	thumbnailLink: string;
	thumbnailWidth: number;
	width: number;
}
