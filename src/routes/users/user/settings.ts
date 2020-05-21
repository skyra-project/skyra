import { objectToTuples } from '@klasa/utils';
import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Events } from '@lib/types/Enums';
import { RawUserSettings } from '@lib/types/settings/raw/RawUserSettings';
import { authenticated, ratelimit } from '@utils/util';
import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { inspect } from 'util';

type Keys = keyof RawUserSettings;

export default class extends Route {

	private readonly kWhitelist: Keys[] = [
		'dark_theme', 'moderation_dm'
		// TODO(kyranet): Handle the following with SettingsGateway's rewrite release.
		/* 'theme_level', 'theme_profile', 'badge_set', 'badge_list', 'banner_list' */
	];

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'userSettings', route: 'users/@me/settings' });
	}

	@authenticated
	@ratelimit(5, 1000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id);
		if (user === undefined) return response.error(500);

		await user.settings.sync();
		return response.json(user.settings.toJSON());
	}

	@authenticated
	@ratelimit(2, 1000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { data: Record<Keys, unknown> | [Keys, unknown][] };

		const user = await this.client.users.fetch(request.auth!.user_id);
		if (user === undefined) return response.error(500);

		const entries = Array.isArray(requestBody.data) ? requestBody.data : objectToTuples(requestBody.data) as [Keys, unknown][];
		if (entries.some(([key]) => !this.kWhitelist.includes(key))) return response.error(400);

		await user.settings.sync();
		try {
			await user.settings.update(entries, { arrayAction: 'overwrite', extraContext: { author: user.id } });
			return response.json({ newSettings: user.settings.toJSON() });
		} catch (errors) {
			this.client.emit(Events.Error,
				`${user.username}[${user.id}] failed user settings update:\n${inspect(errors)}`);

			return response.error(500);
		}
	}

}
