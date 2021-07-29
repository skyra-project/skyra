import { RateLimitManager } from '@sapphire/ratelimits';
import type {
	TwitchHelixBearerToken,
	TwitchHelixGameSearchResult,
	TwitchHelixResponse,
	TwitchHelixUserFollowsResult,
	TwitchHelixUsersSearchResult
} from '#lib/types/definitions/Twitch';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { createHmac } from 'crypto';
import { Time } from '@sapphire/time-utilities';
import { enumerable } from '@sapphire/decorators';

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
	public readonly ratelimitsStreams = new RateLimitManager(Time.Minute * 3000, 1);
	public readonly BASE_URL_HELIX = 'https://api.twitch.tv/helix/';
	public readonly BRANDING_COLOUR = 0x6441a4;

	@enumerable(false)
	private BEARER: TwitchHelixBearerToken = {
		EXPIRE: null,
		TOKEN: null
	};

	@enumerable(false)
	private readonly $clientID = process.env.TWITCH_CLIENT_ID;

	@enumerable(false)
	private readonly $clientSecret = process.env.TWITCH_TOKEN;

	@enumerable(false)
	private readonly $webhookSecret = process.env.TWITCH_WEBHOOK_TOKEN;

	@enumerable(false)
	private readonly kTwitchRequestHeaders = {
		'Content-Type': MimeTypes.ApplicationJson,
		Accept: MimeTypes.ApplicationJson,
		'Client-ID': this.$clientID
	};

	public streamNotificationDrip(id: string) {
		try {
			this.ratelimitsStreams.acquire(id).consume();
			return false;
		} catch {
			return true;
		}
	}

	public async fetchUsers(ids: readonly string[] = [], logins: readonly string[] = []) {
		const search: string[] = [];
		for (const id of ids) search.push(`id=${encodeURIComponent(id)}`);
		for (const login of logins) search.push(`login=${encodeURIComponent(login)}`);
		return this._performApiGETRequest<TwitchHelixResponse<TwitchHelixUsersSearchResult>>(`users?${search.join('&')}`);
	}

	public async fetchGame(ids: readonly string[] = [], names: readonly string[] = []) {
		const search: string[] = [];
		for (const id of ids) search.push(`id=${encodeURIComponent(id)}`);
		for (const name of names) search.push(`name=${encodeURIComponent(name)}`);
		return this._performApiGETRequest<TwitchHelixResponse<TwitchHelixGameSearchResult | undefined>>(`games?${search.join('&')}`);
	}

	public async fetchUserFollowage(userID: string, channelID: string) {
		return this._performApiGETRequest<TwitchHelixResponse<TwitchHelixUserFollowsResult> & { total: number }>(
			`users/follows?from_id=${userID}&to_id=${channelID}`
		);
	}

	public checkSignature(algorithm: string, signature: string, data: any) {
		const hash = createHmac(algorithm, this.$webhookSecret).update(JSON.stringify(data)).digest('hex');

		return hash === signature;
	}

	public fetchBearer() {
		const { TOKEN, EXPIRE } = this.BEARER;
		if (!EXPIRE || !TOKEN) return this._generateBearerToken();
		if (Date.now() > EXPIRE) return this._generateBearerToken();
		return TOKEN;
	}

	public async subscriptionsStreamHandle(streamerID: string, action: TwitchHooksAction = TwitchHooksAction.Subscribe) {
		await fetch(
			'https://api.twitch.tv/helix/webhooks/hub',
			{
				body: JSON.stringify({
					'hub.callback': `${process.env.TWITCH_CALLBACK}${streamerID}`,
					'hub.mode': action,
					'hub.topic': `https://api.twitch.tv/helix/streams?user_id=${streamerID}`,
					'hub.lease_seconds': (9 * Time.Day) / Time.Second,
					'hub.secret': this.$webhookSecret
				}),
				headers: {
					...this.kTwitchRequestHeaders,
					Authorization: `Bearer ${await this.fetchBearer()}`
				},
				method: FetchMethods.Post
			},
			FetchResultTypes.Result
		);
	}

	private async _performApiGETRequest<T>(path: string): Promise<T> {
		return fetch<T>(
			`${this.BASE_URL_HELIX}${path}`,
			{
				headers: {
					...this.kTwitchRequestHeaders,
					Authorization: `Bearer ${await this.fetchBearer()}`
				}
			},
			FetchResultTypes.JSON
		);
	}

	private async _generateBearerToken() {
		const url = new URL('https://id.twitch.tv/oauth2/token');
		url.searchParams.append('client_secret', this.$clientSecret);
		url.searchParams.append('client_id', this.$clientID);
		url.searchParams.append('grant_type', 'client_credentials');
		const respone = await fetch<OauthResponse>(url.href, { method: FetchMethods.Post }, FetchResultTypes.JSON);
		const expires = Date.now() + respone.expires_in * 1000;
		this.BEARER = { TOKEN: respone.access_token, EXPIRE: expires };
		return respone.access_token;
	}
}
