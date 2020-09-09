import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { fetchAllLeaderboardEntries, iteratorRange, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'guildLeaderboard', route: 'guilds/:guild/leaderboard' })
export default class extends Route {
	@ratelimit(2, 2500)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const limit = 'limit' in request.query ? Number(request.query.limit) : 10;
		if (!Number.isInteger(limit) || limit <= 0 || limit > 100) return response.error(400);

		const after = 'after' in request.query ? Number(request.query.after) : 1;
		if (!Number.isInteger(after) || after <= 0 || after > 2500 - limit) return response.error(400);

		const leaderboard = await this.client.leaderboard.fetch(guildID);
		const results = iteratorRange(leaderboard.entries(), after - 1, limit);

		return response.json(await fetchAllLeaderboardEntries(this.client, results));
	}
}
