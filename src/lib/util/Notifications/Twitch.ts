import * as crypto from 'crypto';
import { TOKENS } from '../../../../config';
import { fetch, enumerable, FetchResultTypes } from '../util';
import { Mime, Time } from '../constants';
import { TwitchKrakenChannelSearchResults, TwitchHelixResponse, TwitchHelixGameSearchResult } from '../../types/definitions/Twitch';
import { RateLimitManager } from 'klasa';

const enum ApiVersion {
	Kraken,
	Helix
}

export class Twitch {

	public ratelimitsStreams: RateLimitManager = new RateLimitManager(1, Twitch.RATELIMIT_COOLDOWN);

	@enumerable(false)
	private readonly $clientID: string = TOKENS.TWITCH.CLIENT_ID;

	@enumerable(false)
	private readonly $webhookSecret: string = TOKENS.TWITCH.WEBHOOK_SECRET;

	@enumerable(false)
	private readonly kFetchOptions = {
		headers: {
			'Accept': Mime.Types.ApplicationTwitchV5Json,
			'Client-ID': this.$clientID
		}
	} as const;

	private readonly BASE_URL_HELIX: string = 'https://api.twitch.tv/helix/';
	private readonly BASE_URL_KRAKEN: string = 'https://api.twitch.tv/kraken/';

	public streamNotificationLimited(id: string) {
		const existing = this.ratelimitsStreams.get(id);
		return existing && existing.limited;
	}

	public streamNotificationDrip(id: string) {
		try {
			this.ratelimitsStreams.acquire(id).drip();
			return false;
		} catch {
			return true;
		}
	}

	public async fetchUsersByLogin(logins: readonly string[]) {
		return this._performApiGETRequest(`users?login=${this._formatMultiEntries(logins, true)}`) as Promise<TwitchKrakenChannelSearchResults>;
	}

	public async fetchGame(ids: readonly string[] = [], names: readonly string[] = []) {
		const search: string[] = [];
		for (const id of ids) search.push(`id=${encodeURIComponent(id)}`);
		for (const name of names) search.push(`name=${encodeURIComponent(name)}`);
		return this._performApiGETRequest(`games?${search.join('&')}`, ApiVersion.Helix) as Promise<TwitchHelixResponse<TwitchHelixGameSearchResult>>;
	}

	private _formatMultiEntries(data: readonly string[], replaceEncode = false) {
		const raw = data.map(encodeURIComponent).join(',');
		return replaceEncode
			? raw.replace(/%20/g, '&20')
			: raw;
	}

	private async _performApiGETRequest<T>(path: string, api: ApiVersion = ApiVersion.Kraken): Promise<T> {
		const result = await fetch(`${api === ApiVersion.Kraken ? this.BASE_URL_KRAKEN : this.BASE_URL_HELIX}${path}`, this.kFetchOptions, FetchResultTypes.JSON) as unknown as T;
		return result;
	}

	public static readonly RATELIMIT_COOLDOWN = Time.Minute * 1000;

}

export function checkSignature(algorithm: string, signature: string, data: any): boolean {
	const hash = crypto
		.createHmac(algorithm, TOKENS.TWITCH.WEBHOOK_SECRET)
		.update(JSON.stringify(data))
		.digest('hex');

	return hash === signature;
}

export const TWITCH_REPLACEABLES_REGEX = /%TITLE%|%VIEWER_COUNT%|%GAME_NAME%|%LANGUAGE%|%GAME_ID%|%USER_ID%|%USER_NAME%|%ID%/g;

export const enum TWITCH_REPLACEABLES_MATCHES {
	TITLE = '%TITLE%',
	VIEWER_COUNT = '%VIEWER_COUNT%',
	GAME_NAME = '%GAME_NAME%',
	GAME_ID = '%GAME_ID%',
	LANGUAGE = '%LANGUAGE%',
	USER_ID = '%USER_ID%',
	USER_NAME = '%USER_NAME%',
	ID = '%ID%'
}
