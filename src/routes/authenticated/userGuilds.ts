import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { Permissions } from 'discord.js';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { Events } from '../../lib/types/Enums';
import { inspect } from 'util';

module.exports = class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: '/guilds/:guild/settings', authenticated: true });
	}


	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;

		if (!requestBody.guild_id || !requestBody.data) {
			return response.error(400);
		}

		const botGuild = this.client.guilds.get(requestBody.guild_id);
		if (!botGuild) return response.error(400);

		const member = await botGuild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		const canManage = member.permissions.has(MANAGE_GUILD);
		if (!canManage) return response.error(401);

		const { updated, errors } = await botGuild.settings.update(requestBody.data, { action: 'overwrite' });

		if (errors.length > 0) {
			this.client.emit(Events.Error,
				`${botGuild.name}[${botGuild.id}] failed guild settings update:\n${inspect(errors)}`);

			return response.error(500);
		}


		return response.json(updated);

	}

};
