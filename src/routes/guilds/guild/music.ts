import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../lib/structures/api/ApiResponse';
import { authenticated, ratelimit } from '../../../lib/util/util';
import { Permissions } from 'discord.js';
import { Events } from '../../../lib/types/Enums';
import { inspect } from 'util';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'music', route: 'guilds/:guild/music' });
	}

	@authenticated
	@ratelimit(2, 1000, true)
	public async get(request: ApiRequest, response: ApiResponse) {

		if (!request.params.guild) {
			return response.error(400);
		}

		const guild = this.client.guilds.get(request.params.guild);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		const djRole = guild.settings.get('roles.dj') as string;
		const isDj = djRole ? member.roles.has(djRole) : false;
		const isStaff = true; // TODO

		// If they're not a staff member or DJ, theyre unauthorized.
		if (!isDj && !isStaff) return response.error(401);

		return response.json(guild.music);

	}

	@authenticated
	@ratelimit(2, 1000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { guild_id: string; data: object };

		if (!requestBody.guild_id || !requestBody.data || requestBody.guild_id !== request.params.guild) {
			return response.error(400);
		}

		const botGuild = this.client.guilds.get(requestBody.guild_id);
		if (!botGuild) return response.error(400);

		const member = await botGuild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		const canManage = member.permissions.has(MANAGE_GUILD);
		if (!canManage) return response.error(401);

		const { errors } = await botGuild.settings.update(requestBody.data, { arrayAction: 'overwrite' });

		if (errors.length > 0) {
			this.client.emit(Events.Error,
				`${botGuild.name}[${botGuild.id}] failed guild settings update:\n${inspect(errors)}`);

			return response.error(500);
		}

		return response.json({ newSettings: botGuild.settings.toJSON() });
	}

}
