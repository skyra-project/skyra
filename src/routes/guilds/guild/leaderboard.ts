import { ratelimit } from '#lib/api/utils';
import { iteratorRange } from '#utils/common';
import { fetchAllLeaderBoardEntries } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'guildLeaderboard', route: 'guilds/:guild/leaderboard' })
export class UserRoute extends Route {
	@ratelimit(2, 2500)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const { client } = this.context;
		const guild = client.guilds.cache.get(guildID);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const limit = Reflect.has(request.query, 'limit') ? Number(request.query.limit) : 10;
		if (!Number.isInteger(limit) || limit <= 0 || limit > 100) return response.error(HttpCodes.BadRequest);

		const after = Reflect.has(request.query, 'after') ? Number(request.query.after) : 1;
		if (!Number.isInteger(after) || after <= 0 || after > 2500 - limit) return response.error(HttpCodes.BadRequest);

		const leaderboard = await client.leaderboard.fetch(guildID);
		const results = iteratorRange(leaderboard.entries(), after - 1, limit);

		return response.json(fetchAllLeaderBoardEntries(guild, results));
	}
}
