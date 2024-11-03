import { flattenGuild } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { api } from '#lib/discord/Api';
import { seconds } from '#utils/common';
import { HttpCodes, Route } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(5), 2, true)
	public async run(request: Route.Request, response: Route.Response) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(HttpCodes.BadRequest);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		const emojis = await api().guilds.getEmojis(guildId);
		return response.json({ ...flattenGuild(guild), emojis });
	}
}
