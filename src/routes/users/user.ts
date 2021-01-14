import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { FlattenedGuild, flattenGuild, flattenUser } from '#lib/api/ApiTransformers';
import { authenticated, ratelimit } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'users/@me' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id).catch(() => null);
		if (user === null) return response.error(500);

		const guilds: FlattenedGuild[] = [];
		for (const guild of this.client.guilds.cache.values()) {
			if (guild.members.cache.has(user.id)) guilds.push(flattenGuild(guild));
		}
		return response.json({ ...flattenUser(user), guilds });
	}
}
