import { flattenMember } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild/members/:member' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.context.client.guilds.cache.get(guildID);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const memberAuthor = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!memberAuthor) return response.error(HttpCodes.BadRequest);
		if (!(await canManage(guild, memberAuthor))) return response.error(HttpCodes.Forbidden);

		const memberID = request.params.member;
		const member = await guild.members.fetch(memberID).catch(() => null);
		return member ? response.json(flattenMember(member)) : response.error(HttpCodes.NotFound);
	}
}
