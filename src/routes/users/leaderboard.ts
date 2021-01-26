import { ratelimit } from '#lib/api/utils';
import { fetchAllLeaderboardEntries, iteratorRange } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'globalLeaderboard', route: 'users/leaderboard' })
export class UserRoute extends Route {
	@ratelimit(2, 2500)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const limit = Reflect.has(request.query, 'limit') ? Number(request.query.limit) : 10;
		if (!Number.isInteger(limit) || limit <= 0 || limit > 100) return response.error(HttpCodes.BadRequest);

		const after = Reflect.has(request.query, 'after') ? Number(request.query.after) : 1;
		if (!Number.isInteger(after) || after <= 0 || after > 25000 - limit) return response.error(HttpCodes.BadRequest);

		const { client } = this.context;
		const leaderboard = await client.leaderboard.fetch();
		const results = iteratorRange(leaderboard.entries(), after - 1, limit);

		return response.json(await fetchAllLeaderboardEntries(client, results));
	}
}
