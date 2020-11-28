import { DbSet } from '#lib/database';
import { ApiRequest } from '#lib/structures/api/ApiRequest';
import { ApiResponse } from '#lib/structures/api/ApiResponse';
import { ratelimit } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'banners' })
export default class extends Route {
	@ratelimit(2, 2500)
	public async get(_: ApiRequest, response: ApiResponse) {
		const { banners } = await DbSet.connect();
		const entries = await banners.find();
		return response.json(entries);
	}
}
