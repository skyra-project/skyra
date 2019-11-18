import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../lib/structures/api/ApiRequest';
import ApiResponse from '../lib/structures/api/ApiResponse';
import { ratelimit } from '../lib/util/util';
import { RawBannerSettings } from '../lib/types/settings/raw/RawBannerSettings';
import { Databases } from '../lib/types/constants/Constants';

export default class extends Route {

	private kInternalCache: RawBannerSettings[] | null = null;
	private kInternalCacheTTL = 300000;

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'banners' });
	}

	@ratelimit(2, 2500)
	public async get(_: ApiRequest, response: ApiResponse) {
		if (this.kInternalCache === null) {
			this.kInternalCache = await this.client.providers.default.getAll(Databases.Banners) as RawBannerSettings[];
			this.client.setTimeout(() => {
				this.kInternalCache = null;
			}, this.kInternalCacheTTL);
		}
		return response.json(this.kInternalCache);
	}

}
