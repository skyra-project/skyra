import { KlasaClient, KlasaMessage } from 'klasa';
import { TOKENS } from '../../../config';
import { Events } from '../types/Enums';
import { fetch, FetchResultTypes } from './util';

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function queryGoogleMapsAPI(message: KlasaMessage, client: KlasaClient, location: string) {
	const url = new URL(GOOGLE_MAPS_API_URL);
	url.searchParams.append('address', location);
	url.searchParams.append('key', TOKENS.GOOGLE_MAPS_API_KEY);
	const { results, status } = await fetch(url, FetchResultTypes.JSON) as GoogleMapsResultOk;

	if (status !== 'OK') throw message.language.tget(handleNotOK(status, client));
	if (results.length === 0) throw message.language.tget('GOOGLE_ERROR_ZERO_RESULTS');

	return [
		results[0].formatted_address,
		results[0].geometry.location.lat,
		results[0].geometry.location.lng,
		results[0].address_components
	] as [string, number, number, GoogleMapsOkAddressComponent[]];
}

export function handleNotOK(status: string, client: KlasaClient) {
	switch (status) {
		case 'ZERO_RESULTS':
			return 'GOOGLE_ERROR_ZERO_RESULTS';
		case 'REQUEST_DENIED':
			return 'GOOGLE_ERROR_REQUEST_DENIED';
		case 'INVALID_REQUEST':
			return 'GOOGLE_ERROR_INVALID_REQUEST';
		case 'OVER_QUERY_LIMIT':
			return 'GOOGLE_ERROR_OVER_QUERY_LIMIT';
		default:
			client.emit(Events.Wtf, `Google::handleNotOK | Unknown Error: ${status}`);
			return 'GOOGLE_ERROR_UNKNOWN';
	}
}

export interface GoogleMapsResultOk {
	results: GoogleMapsResultOkResult[];
	status: string;
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
