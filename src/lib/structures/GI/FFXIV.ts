import { Collection } from 'discord.js';
import * as querystring from 'querystring';
import { TOKENS } from '../../../../config';
import { fetch, FetchResultTypes } from '../../util/util';
import { GameIntegrationsManager } from './GameIntegrationsManager';
import { classLimitInitialization, limitMethod, MethodRatelimitedError } from '../../util/Limiter';
import { Time } from '../../util/constants';
import { FFXIVResults, FFXIVCharacterSearchResult, FFXIVServerNames, FFXIVItemEntry, FFXIVItems } from '../../types/games/FFXIV';
import { sleep } from '@klasa/utils';

@classLimitInitialization()
export class FFXIV {

	public SERVERS!: FFXIVServerNames;
	public ITEMS!: FFXIVItems;

	private readonly cache: Collection<string, FFXIVCacheEntry> = new Collection();
	private readonly gim: GameIntegrationsManager;

	private readonly KEY: string = TOKENS.XIVAPI_KEY;
	private readonly BASE_URL: string = 'https://xivapi.com/';

	public constructor(gim: GameIntegrationsManager) {
		this.gim = gim;
	}

	public async initIntergration(): Promise<FFXIV> {
		this.SERVERS = await this._fetchPossibleServers() as FFXIVServerNames;
		this.ITEMS = await this._fetchAllItems();
		return this;
	}

	public async searchCharacters(name: string, server: string): Promise<FFXIVResults<FFXIVCharacterSearchResult>> {
		const query = `search(${encodeURIComponent(name)}@${server})`;
		if (!this.cache.has(query) || (this.cache.get(query)!.expire < Date.now())) return this.cache.get(query)!.data as FFXIVResults<FFXIVCharacterSearchResult>;
		const data = await this._searchCharacters(name, server) as FFXIVResults<FFXIVCharacterSearchResult>;
		this.cache.set(query, { data, expire: Date.now() + (Time.Minute as number) });
		return data;
	}

	@limitMethod('global', FFXIV.RATELIMIT_BUCKET, Time.Second)
	public _searchCharacters(name: string, server: string) {
		if (!this.SERVERS.includes(server)) throw 'Invalid server name.';
		return this._get('character/search', [['name', encodeURIComponent(name)], ['server', server]]) as Promise<FFXIVResults<FFXIVCharacterSearchResult> | MethodRatelimitedError>;
	}

	private async _fetchAllItems(): Promise<FFXIVItems> {
		let all: FFXIVItems = [];
		let pages: { next: number, current: number } = { next: 1, current: 1 };
		do {
			const data = await this._fetchItemsPage(pages.next) as unknown as FFXIVResults<FFXIVItemEntry>;
			pages = { next: data.Pagination.PageNext as number, current: data.Pagination.Page };
			all = all.concat(data.Results);
			await sleep(Time.Second / 10);
		} while ((pages.current !== pages.next) && (pages.next > pages.current));
		return all;
	}

	@limitMethod('global', FFXIV.RATELIMIT_BUCKET, Time.Second)
	private _fetchPossibleServers(): Promise<FFXIVServerNames | MethodRatelimitedError> {
		return this._get('servers') as Promise<FFXIVServerNames>;
	}

	@limitMethod('global', FFXIV.RATELIMIT_BUCKET, Time.Second)
	private _fetchItemsPage(page: number): Promise<FFXIVResults<FFXIVItemEntry> | MethodRatelimitedError> {
		return this._get('item', [['limit', '3000'], ['page', page.toString()]]) as Promise<FFXIVResults<FFXIVItemEntry>>;
	}

	private _get(path: string, query: [string, string | string[]][] = []): Promise<unknown> {
		if (!query.some(val => val[0] === 'private_key')) query.push(['private_key', this.KEY]);
		const qs = querystring.stringify(Object.fromEntries(query));
		return fetch(`${this.BASE_URL}${path}?${qs}`, FetchResultTypes.JSON);
	}

	private static readonly RATELIMIT_BUCKET: number = 20;

}

export interface FFXIVCacheEntry {
	data: unknown;
	expire: number;
}

