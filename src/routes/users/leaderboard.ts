import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { fetchAllLeaderboardEntries, iteratorRange, ratelimit } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'globalLeaderboard', route: 'users/leaderboard' })
export default class extends Route {
	@ratelimit(2, 2500)
	public async get(request: ApiRequest, response: ApiResponse) {
		const limit = Reflect.has(request.query, 'limit') ? Number(request.query.limit) : 10;
		if (!Number.isInteger(limit) || limit <= 0 || limit > 100) return response.error(400);

		const after = Reflect.has(request.query, 'after') ? Number(request.query.after) : 1;
		if (!Number.isInteger(after) || after <= 0 || after > 25000 - limit) return response.error(400);

		const leaderboard = await this.client.leaderboard.fetch();
		const results = iteratorRange(leaderboard.entries(), after - 1, limit);

		return response.json(await fetchAllLeaderboardEntries(this.client, results));
	}
}
