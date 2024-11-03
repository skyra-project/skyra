import { flattenGuild, flattenUser, type FlattenedGuild } from '#lib/api/ApiTransformers';
import { authenticated, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { HttpCodes, Route } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(5), 2, true)
	public async run(request: Route.Request, response: Route.Response) {
		const { client } = this.container;
		const user = await client.users.fetch(request.auth!.id).catch(() => null);
		if (user === null) return response.error(HttpCodes.InternalServerError);

		const guilds: FlattenedGuild[] = [];
		for (const guild of client.guilds.cache.values()) {
			if (guild.members.cache.has(user.id)) guilds.push(flattenGuild(guild));
		}
		return response.json({ ...flattenUser(user), guilds });
	}
}
