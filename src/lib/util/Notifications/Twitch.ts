import { TwitchHelixBearerToken, TwitchHelixGameSearchResult, TwitchHelixResponse, TwitchHelixUsersSearchResult, TwitchKrakenChannelSearchResults } from '@lib/types/definitions/Twitch';
import { TOKENS, TWITCH_CALLBACK } from '@root/config';
import { Mime, Time } from '@utils/constants';
import { enumerable, fetch, FetchMethods, FetchResultTypes } from '@utils/util';
import { createHmac } from 'crypto';
import { RateLimitManager } from 'klasa';

export const enum ApiVersion {
	Kraken,
	Helix
}

export const enum TwitchHooksAction {
	Subscribe = 'subscribe',
	Unsubscribe = 'unsubscribe'
}

export interface OauthResponse {
	access_token: string;
	refresh_token: string;
	scope: string;
	expires_in: number;
}

export class Twitch {

	public readonly ratelimitsStreams = new RateLimitManager(1, Twitch.RATELIMIT_COOLDOWN);
	public readonly BASE_URL_HELIX = 'https://api.twitch.tv/helix/';
	public readonly BASE_URL_KRAKEN = 'https://api.twitch.tv/kraken/';

	@enumerable(false)
	private BEARER: TwitchHelixBearerToken = {
		EXPIRE: null,
		TOKEN: null
	};

	@enumerable(false)
	private readonly $clientID = TOKENS.TWITCH_CLIENT_ID;

	@enumerable(false)
	private readonly $clientSecret = TOKENS.TWITCH_SECRET;

	@enumerable(false)
	private readonly $webhookSecret = TOKENS.TWITCH_WEBHOOK_SECRET;

	@enumerable(false)
	private readonly kFetchOptions = {
		headers: {
			'Accept': Mime.Types.ApplicationTwitchV5Json,
			'Client-ID': this.$clientID
		}
	} as const;

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

	public async fetchUsers(ids: readonly string[] = [], logins: readonly string[] = []) {
		const search: string[] = [];
		for (const id of ids) search.push(`id=${encodeURIComponent(id)}`);
		for (const login of logins) search.push(`login=${encodeURIComponent(login)}`);
		return this._performApiGETRequest(`users?${search.join('&')}`, ApiVersion.Helix) as Promise<TwitchHelixResponse<TwitchHelixUsersSearchResult>>;
	}

	public async fetchGame(ids: readonly string[] = [], names: readonly string[] = []) {
		const search: string[] = [];
		for (const id of ids) search.push(`id=${encodeURIComponent(id)}`);
		for (const name of names) search.push(`name=${encodeURIComponent(name)}`);
		return this._performApiGETRequest(`games?${search.join('&')}`, ApiVersion.Helix) as Promise<TwitchHelixResponse<TwitchHelixGameSearchResult>>;
	}

	public checkSignature(algorithm: string, signature: string, data: any) {
		const hash = createHmac(algorithm, this.$webhookSecret)
			.update(JSON.stringify(data))
			.digest('hex');

		return hash === signature;
	}

	public fetchBearer() {
		const { TOKEN, EXPIRE } = this.BEARER;
		if (!EXPIRE || !TOKEN) return this._generateBearerToken();
		if (Date.now() > EXPIRE) return this._generateBearerToken();
		return TOKEN;
	}

	public async subscriptionsStreamHandle(streamerID: string, action: TwitchHooksAction = TwitchHooksAction.Subscribe) {
		const response = await fetch('https://api.twitch.tv/helix/webhooks/hub', {
			body: JSON.stringify({
				'hub.callback': `${TWITCH_CALLBACK}${streamerID}`,
				'hub.mode': action,
				'hub.topic': `https://api.twitch.tv/helix/streams?user_id=${streamerID}`,
				'hub.lease_seconds': (9 * Time.Day) / Time.Second,
				'hub.secret': this.$webhookSecret
			}),
			headers: {
				'Authorization': `Bearer ${await this.fetchBearer()}`,
				'Content-Type': Mime.Types.ApplicationJson
			},
			method: FetchMethods.Post
		}, FetchResultTypes.Result);
		if (!response.ok) throw new Error(`[${response.status}] Failed to subscribe to action.`);
		return response;
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

	private async _generateBearerToken() {
		const url = new URL('https://id.twitch.tv/oauth2/token');
		url.searchParams.append('client_secret', this.$clientSecret);
		url.searchParams.append('client_id', this.$clientID);
		url.searchParams.append('grant_type', 'client_credentials');
		const respone = await fetch(url.href, { method: FetchMethods.Post }, FetchResultTypes.JSON) as OauthResponse;
		const expires = Date.now() + (respone.expires_in * 1000);
		this.BEARER = { TOKEN: respone.access_token, EXPIRE: expires };
		return respone.access_token;
	}

	public static readonly RATELIMIT_COOLDOWN = Time.Minute * 3 * 1000;

}

export const TWITCH_REPLACEABLES_REGEX = /%ID%|%TITLE%|%VIEWER_COUNT%|%GAME_NAME%|%GAME_ID%|%LANGUAGE%|%USER_ID%|%USER_NAME%/g;

export const enum TWITCH_REPLACEABLES_MATCHES {
	ID = '%ID%',
	TITLE = '%TITLE%',
	VIEWER_COUNT = '%VIEWER_COUNT%',
	GAME_NAME = '%GAME_NAME%',
	GAME_ID = '%GAME_ID%',
	LANGUAGE = '%LANGUAGE%',
	USER_ID = '%USER_ID%',
	USER_NAME = '%USER_NAME%'
}
