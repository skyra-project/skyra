import { flattenMember } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { HttpCodes, Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: 'guilds/:guild/members/:member' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(5), 2, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const memberAuthor = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!memberAuthor) return response.error(HttpCodes.BadRequest);
		if (!(await canManage(guild, memberAuthor))) return response.error(HttpCodes.Forbidden);

		const memberId = request.params.member;
		const member = await guild.members.fetch(memberId).catch(() => null);
		return member ? response.json(flattenMember(member)) : response.error(HttpCodes.NotFound);
	}
}
