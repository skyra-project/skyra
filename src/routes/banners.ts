import { ratelimit } from '#lib/api/utils';
import { DbSet } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'banners' })
export default class extends Route {
	@ratelimit(2, 2500)
	public async [methods.GET](_: ApiRequest, response: ApiResponse) {
		const { banners } = await DbSet.connect();
		const entries = await banners.find();
		return response.json(entries);
	}
}
