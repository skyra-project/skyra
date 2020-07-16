import { objectToTuples } from '@klasa/utils';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Events } from '@lib/types/Enums';
import { RawGuildSettings } from '@lib/types/settings/raw/RawGuildSettings';
import { canManage } from '@utils/API';
import { authenticated, ratelimit } from '@utils/util';
import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { inspect } from 'util';

type Keys = keyof RawGuildSettings;

export default class extends Route {

	private readonly kBlacklist: Keys[] = ['commandUses'];

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'guildSettings', route: 'guilds/:guild/settings' });
	}

	@authenticated()
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		if (!canManage(guild, member)) return response.error(403);

		return response.json(guild.settings.toJSON());
	}

	@authenticated()
	@ratelimit(2, 1000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { guild_id: string; data: Record<Keys, unknown> | [Keys, unknown][] | undefined };

		if (!requestBody.guild_id || !requestBody.data || requestBody.guild_id !== request.params.guild) {
			return response.error(400);
		}

		const botGuild = this.client.guilds.get(requestBody.guild_id);
		if (!botGuild) return response.error(400);

		const member = await botGuild.members.fetch(request.auth!.user_id).catch(() => null);
		if (!member) return response.error(400);

		if (!canManage(botGuild, member)) return response.error(403);

		const entries = Array.isArray(requestBody.data) ? requestBody.data : objectToTuples(requestBody.data) as [Keys, unknown][];
		if (entries.some(([key]) => this.kBlacklist.includes(key))) return response.error(400);

		await botGuild.settings.sync();
		try {
			await botGuild.settings.update(entries, { arrayAction: 'overwrite', extraContext: { author: member.id } });
			return response.json({ newSettings: botGuild.settings.toJSON() });
		} catch (errors) {
			this.client.emit(Events.Error,
				`${botGuild.name}[${botGuild.id}] failed guild settings update:\n${inspect(errors)}`);

			return response.error(500);
		}
	}

}
