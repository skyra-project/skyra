import { FlattenedGuild, flattenGuild, flattenUser } from '#lib/api/ApiTransformers';
import { authenticated, ratelimit } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'users/@me' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { client } = this.context;
		const user = await client.users.fetch(request.auth!.id).catch(() => null);
		if (user === null) return response.error(HttpCodes.InternalServerError);

		const guilds: FlattenedGuild[] = [];
		for (const guild of client.guilds.cache.values()) {
			if (guild.members.cache.has(user.id)) guilds.push(flattenGuild(guild));
		}
		return response.json({ ...flattenUser(user), guilds });
	}
}
