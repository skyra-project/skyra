import * as crypto from 'crypto';
import { TOKENS } from '../../../../config';
import { fetch, enumerable } from '../util';
import { Mime } from '../constants';
import { TwitchKrakenChannelSearchResults, TwitchHelixResponse, TwitchHelixGameSearchResult } from '../../types/definitions/Twitch';

const enum ApiVersion {
	Kraken,
	Helix
}

export class Twitch {

	@enumerable(false)
	private readonly $clientID: string = TOKENS.TWITCH.CLIENT_ID;

	@enumerable(false)
	private readonly $webhookSecret: string = TOKENS.TWITCH.WEBHOOK_SECRET;

	private readonly BASE_URL_HELIX: string = 'https://api.twitch.tv/helix/';
	private readonly BASE_URL_KRAKEN: string = 'https://api.twitch.tv/kraken/';

	private kFetchOptions = {
		headers: {
			'Accept': Mime.Types.ApplicationTwitchV5Json,
			'Client-ID': this.$clientID
		}
	} as const;

	public async fetchUsersByLogin(logins: string[]): Promise<TwitchKrakenChannelSearchResults> {
		return this._performApiGETRequest(`users?login=${this._formatMultiEntries(logins, true)}`);
	}

	public async fetchGame(ids: string[] = [], names: string[] = []): Promise<TwitchHelixResponse<TwitchHelixGameSearchResult>> {
		let search = '';
		for (const id of ids) search = `${search}&id=${encodeURIComponent(id)}`;
		for (const name of names) search = `${search}&name=${encodeURIComponent(name)}`;
		return this._performApiGETRequest(`games?${search}`, ApiVersion.Helix);
	}

	private _formatMultiEntries(data: string[], replaceEncode?: boolean) {
		let out = data.map(encodeURIComponent).join(',');
		replaceEncode ? out = out.replace(/%20/g, '&20') : null;
		return out;
	}

	private async _performApiGETRequest<T>(path: string, api: ApiVersion = ApiVersion.Kraken): Promise<T> {
		const result = await fetch(`${api === ApiVersion.Kraken ? this.BASE_URL_KRAKEN : this.BASE_URL_HELIX}${path}`, this.kFetchOptions, 'json') as unknown as T;
		return result;
	}

}

export function checkSignature(algorithm: string, signature: string, data: any): boolean {
	const hash = crypto
		.createHmac(algorithm, TOKENS.TWITCH.WEBHOOK_SECRET)
		.update(JSON.stringify(data))
		.digest('hex');

	return hash === signature;
}

export const enum TWITCH_REPLACEABLES_MATCHES {
	TITLE = '%TITLE%',
	VIEWER_COUNT = '%VIEWER_COUNT%',
	GAME_NAME = '%GAME_NAME%',
	GAME_ID = '%GAME_ID%',
	LANGUAGE = '%LANGUAGE%',
	USER_ID = '%USER_ID%',
	USER_NAME = '%USER_NAME%'
}
