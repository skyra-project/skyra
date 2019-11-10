import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../lib/structures/api/ApiResponse';
import { Snowflake } from 'discord.js';
import { LeaderboardUser } from '../../../lib/util/Leaderboard';
import { isNumber } from '@klasa/utils';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'guilds/:guild/leaderboard' });
	}

	public async get(request: ApiRequest, response: ApiResponse) {

		const guildID = request.params.guild;
		if (!this.client.guilds.has(guildID)) return response.error(400);
		const leaderboard = await this.client.leaderboard.fetch(guildID);

		if ('id' in request.query) {

			const id = request.query.id as string;
			const lbData = leaderboard.get(id);
			if (!lbData) return response.error(404);

			if (lbData.name === null) lbData.name = (await this.client.users.fetch(id)).username;
			return response.status(200).json({ id, ...lbData });
		} else if ('position' in request.query) {

			const position = Number(request.query.position);
			const id = leaderboard.findKey(e => e.position === position);
			if (typeof id === 'undefined') return response.error(404);

			const lbData = leaderboard.get(id) as LeaderboardUser;
			if (lbData.name === null) lbData.name = (await this.client.users.fetch(id)).username;

			return response.status(200).json({ id, ...lbData });
		}

		const limit = 'limit' in request.query ? Number(request.query.limit) : 10;
		const before = 'before' in request.query ? Number(request.query.before) - 1 : undefined;
		const after = 'after' in request.query ? Number(request.query.after) + 1 : 1;

		if (!isNumber(limit) || limit! > 1000) return response.error(400);
		if (!isNumber(before) || (before && (before! < 0))) return response.error(400);
		if (!isNumber(after)) return response.error(400);

		const data = await this.getLeaderboardData(guildID, { limit, before, after });
		return response.status(200).json(data);


	}

	private async getLeaderboardData(guild: string, { limit, before, after: lowerBound }: FunctionOptions) {

		const leaderboardData = await this.client.leaderboard.fetch(guild);
		const upperBound = before ? before : limit + lowerBound - 1;
		const data: KdhLeaderboardUser[] = [];
		const slicedLeaderboard = Array.from(leaderboardData.entries()).slice(lowerBound - 1, upperBound);

		for (const element of slicedLeaderboard) {
			let [id, { name, points, position }] = element;
			if (name === null) name = (await this.client.users.fetch(id)).username;
			data.push({ id, name, points, position });
		}

		return data;
	}

}

interface KdhLeaderboardUser {
	id: Snowflake;
	name: string;
	position: number;
	points: number;
}

interface FunctionOptions {
	limit: number;
	before?: number;
	after: number;
}
