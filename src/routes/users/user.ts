import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { authenticated, ratelimit } from '../../lib/util/util';
import { flattenUser, flattenGuild, FlattenedGuild } from '../../lib/util/Models/ApiTransform';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'users/@me' });
	}

	@authenticated
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id);
		if (!user) return response.error(500);

		const guilds: FlattenedGuild[] = [];
		for (const guild of this.client.guilds.values()) {
			if (guild.memberSnowflakes.has(user.id)) guilds.push(flattenGuild(guild));
		}
		return response.json({ ...flattenUser(user), guilds });
	}

}
