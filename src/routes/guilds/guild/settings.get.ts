import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { readSettings, serializeSettings, type ReadonlyGuildData } from '#lib/database';
import { seconds } from '#utils/common';
import { HttpCodes, Route, type MimeType } from '@sapphire/plugin-api';

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

		const settings = await readSettings(guild);
		return this.sendSettings(response, settings);
	}

	private sendSettings(response: Route.Response, settings: ReadonlyGuildData) {
		return response
			.status(HttpCodes.OK)
			.setContentType('application/json' satisfies MimeType)
			.end(serializeSettings(settings));
	}
}
