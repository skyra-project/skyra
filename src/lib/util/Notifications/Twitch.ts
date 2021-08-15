import {
	OauthResponse,
	TwitchEventSubResult,
	TwitchHelixBearerToken,
	TwitchHelixGameSearchResult,
	TwitchHelixResponse,
	TwitchHelixUserFollowsResult,
	TwitchHelixUsersSearchResult,
	TwitchSubscriptionTypes
} from '#lib/types/definitions/Twitch';
import { Enumerable } from '@sapphire/decorators';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { RateLimitManager } from '@sapphire/ratelimits';
import { Time } from '@sapphire/time-utilities';
import { URL } from 'url';
import { createHmac } from 'crypto';

export class Twitch {
	public readonly ratelimitsStreams = new RateLimitManager(Time.Minute * 3000, 1);
	public readonly BASE_URL_HELIX = 'https://api.twitch.tv/helix';
	public readonly BRANDING_COLOUR = 0x6441a4;

	@Enumerable(false)
	private BEARER: TwitchHelixBearerToken = {
		EXPIRE: null,
		TOKEN: null
	};

	@Enumerable(false)
	private readonly clientId = process.env.TWITCH_CLIENT_ID;

	@Enumerable(false)
	private readonly clientSecret = process.env.TWITCH_TOKEN;

	@Enumerable(false)
	private readonly eventSubSecret = process.env.TWITCH_EVENTSUB_SECRET;

	@Enumerable(false)
	private readonly kTwitchRequestHeaders = {
		'Content-Type': MimeTypes.ApplicationJson,
		Accept: MimeTypes.ApplicationJson,
		'Client-ID': this.clientId
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

	public async fetchUserFollowage(userId: string, channelId: string) {
		return this._performApiGETRequest<TwitchHelixResponse<TwitchHelixUserFollowsResult> & { total: number }>(
			`users/follows?from_id=${userId}&to_id=${channelId}`
		);
	}

	public checkSignature(algorithm: string, signature: string, data: any) {
		const hash = createHmac(algorithm, this.eventSubSecret).update(data).digest('hex');

		return hash === signature;
	}

	public fetchBearer() {
		const { TOKEN, EXPIRE } = this.BEARER;
		if (!EXPIRE || !TOKEN) return this._generateBearerToken();
		if (Date.now() > EXPIRE) return this._generateBearerToken();
		return TOKEN;
	}

	/**
	 * Adds a new Twitch subscription
	 */
	public async subscriptionsStreamHandle(
		streamerId: string,
		subscriptionType: TwitchSubscriptionTypes = TwitchSubscriptionTypes.StreamOnline
	): Promise<string> {
		const subscription = await fetch<TwitchHelixResponse<TwitchEventSubResult>>(
			`${this.BASE_URL_HELIX}/eventsub/subscriptions`,
			{
				body: JSON.stringify({
					type: subscriptionType,
					version: '1',
					condition: {
						broadcaster_user_id: streamerId
					},
					transport: {
						method: 'webhook',
						callback: process.env.TWITCH_CALLBACK,
						secret: this.eventSubSecret
					}
				}),
				headers: {
					...this.kTwitchRequestHeaders,
					Authorization: `Bearer ${await this.fetchBearer()}`
				},
				method: FetchMethods.Post
			},
			FetchResultTypes.JSON
		);

		return subscription.data[0].id;
	}

	/**
	 * Removes a Twitch subscription based on its ID
	 * @param subscriptionId the ID to remove
	 */
	public async removeSubscription(subscriptionId: string): Promise<void> {
		const url = new URL(`${this.BASE_URL_HELIX}/eventsub/subscriptions`);
		url.searchParams.append('id', subscriptionId);

		await fetch<TwitchHelixResponse<TwitchEventSubResult>>(
			url,
			{
				headers: {
					...this.kTwitchRequestHeaders,
					Authorization: `Bearer ${await this.fetchBearer()}`
				},
				method: FetchMethods.Delete
			},
			FetchResultTypes.Result
		);
	}

	// @ts-ignore This is a convenience function for debugging / eval-ling
	private async getCurrentTwitchSubscriptions(): Promise<TwitchHelixResponse<TwitchEventSubResult>> {
		return this._performApiGETRequest<TwitchHelixResponse<TwitchEventSubResult>>('eventsub/subscriptions');
	}

	// @ts-ignore This is a convenience function for debugging / eval-ling
	private async removeAllTwitchSubscriptions(): Promise<void> {
		const allSubscriptions = await this.getCurrentTwitchSubscriptions();
		const allSubscriptionIds = allSubscriptions.data.map((entry) => entry.id);

		await Promise.all(allSubscriptionIds.map((subscriptionId) => this.removeSubscription(subscriptionId)));
	}

	private async _performApiGETRequest<T>(path: string): Promise<T> {
		return fetch<T>(
			`${this.BASE_URL_HELIX}/${path}`,
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
		url.searchParams.append('client_secret', this.clientSecret);
		url.searchParams.append('client_id', this.clientId);
		url.searchParams.append('grant_type', 'client_credentials');
		const respone = await fetch<OauthResponse>(url.href, { method: FetchMethods.Post }, FetchResultTypes.JSON);
		const expires = Date.now() + respone.expires_in * 1000;
		this.BEARER = { TOKEN: respone.access_token, EXPIRE: expires };
		return respone.access_token;
	}
}
