import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { canManage } from '@utils/API';
import { flattenRole } from '@utils/Models/ApiTransform';
import { authenticated, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild/roles/:role' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		if (!canManage(guild, member)) return response.error(403);

		const roleID = request.params.role;
		const role = guild.roles.cache.get(roleID);
		return role ? response.json(flattenRole(role)) : response.error(404);
	}
}
