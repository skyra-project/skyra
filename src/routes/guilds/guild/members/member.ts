import { Permissions } from 'discord.js';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../../lib/structures/api/ApiResponse';
import { flattenMember } from '../../../../lib/util/Models/ApiTransform';
import { ApplyOptions, authenticated, ratelimit } from '../../../../lib/util/util';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guild/members/:member'
})
export default class extends Route {

	@authenticated
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.error(400);

		const memberAuthor = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!memberAuthor) return response.error(400);

		const memberID = request.params.member;
		const canManage = memberAuthor.id === memberID || memberAuthor.permissions.has(MANAGE_GUILD);
		if (!canManage) return response.error(401);

		const member = await guild.members.fetch(memberID).catch(() => null);
		return member ? response.json(flattenMember(member)) : response.error(404);
	}

}
