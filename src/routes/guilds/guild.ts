import { flattenGuild } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { api } from '#lib/discord/Api';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.context.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(400);

		if (!(await canManage(guild, member))) return response.error(403);

		const emojis = await api().guilds(guildID).emojis.get();
		return response.json({ ...flattenGuild(guild), emojis });
	}
}
