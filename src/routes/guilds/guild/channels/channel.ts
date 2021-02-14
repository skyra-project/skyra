import { flattenChannel } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild/channels/:channel' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.context.client.guilds.cache.get(guildID);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(HttpCodes.BadRequest);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		const channelID = request.params.channel;
		const channel = guild.channels.cache.get(channelID);
		return channel ? response.json(flattenChannel(channel)) : response.error(HttpCodes.NotFound);
	}
}
