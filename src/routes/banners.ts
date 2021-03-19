import { ratelimit } from '#lib/api/utils';
import { DbSet } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'banners' })
export class UserRoute extends Route {
	@ratelimit(2, 2500)
	public async [methods.GET](_: ApiRequest, response: ApiResponse) {
		const { banners } = this.context.db;
		const entries = await banners.find();
		return response.json(entries);
	}
}
