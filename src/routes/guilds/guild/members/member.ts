import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../../lib/structures/api/ApiResponse';
import { authenticated, ratelimit } from '../../../../lib/util/util';
import { Permissions } from 'discord.js';
import { flattenMember } from '../../../../lib/util/Models/ApiTransform';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'guilds/:guild/members/:member' });
	}

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
