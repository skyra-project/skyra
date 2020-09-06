import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { canManage } from '@utils/API';
import { flattenMember } from '@utils/Models/ApiTransform';
import { authenticated, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild/members/:member' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const memberAuthor = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!memberAuthor) return response.error(400);
		if (!canManage(guild, memberAuthor)) return response.error(403);

		const memberID = request.params.member;
		const member = await guild.members.fetch(memberID).catch(() => null);
		return member ? response.json(flattenMember(member)) : response.error(404);
	}
}
