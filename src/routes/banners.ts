import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { DbSet } from '@lib/structures/DbSet';
import { ratelimit } from '@utils/util';
import { Route, RouteStore } from 'klasa-dashboard-hooks';

export default class extends Route {

	private kInternalCacheTTL = 300000;

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'banners' });
	}

	@ratelimit(2, 2500)
	public async get(_: ApiRequest, response: ApiResponse) {
		const { banners } = await DbSet.connect();
		const entries = await banners.find({ cache: this.kInternalCacheTTL });
		return response.json(entries);
	}

}
