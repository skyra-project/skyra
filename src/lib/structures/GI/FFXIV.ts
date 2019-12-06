import { Collection } from 'discord.js';
import * as querystring from 'querystring';
import { TOKENS } from '../../../../config';
import { fetch, FetchResultTypes } from '../../util/util';
import { GameIntegrationsManager } from './GameIntegrationsManager';

export class FFXIV {

	public SERVERS!: string[];

	private readonly cache: Collection<string, FFXIVCacheEntry> = new Collection();
	private readonly gim: GameIntegrationsManager;

	private readonly KEY: string = TOKENS.XIVAPI_KEY;
	private readonly BASE_URL: string = 'https://xivapi.com/';

	public constructor(gim: GameIntegrationsManager) {
		this.gim = gim;
	}

	public async initIntergration(): Promise<FFXIV> {
		this.SERVERS = await this._fetchPossibleServers();
		return this;
	}

	private _fetchPossibleServers(): Promise<string[]> {
		return this._get('servers') as Promise<string[]>;
	}

	private _get(path: string, query: [string, string | string[]][] = []): Promise<unknown> {
		if (!query.some((val) => val[0] === 'private_key')) query.push(['private_key', this.KEY]);
		const qs = querystring.stringify(Object.fromEntries(query));
		return fetch(`${this.BASE_URL}${path}?${qs}`, FetchResultTypes.JSON);
	}

}

export interface FFXIVCacheEntry {
	data: unknown;
	expire: number;
}

