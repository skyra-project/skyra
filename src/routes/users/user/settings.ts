import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../lib/structures/api/ApiResponse';
import { authenticated, ratelimit } from '../../../lib/util/util';
import { Events } from '../../../lib/types/Enums';
import { inspect } from 'util';
import { SchemaEntry } from 'klasa';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'userSettings', route: 'users/@me/settings' });
	}

	@authenticated
	@ratelimit(5, 1000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id);
		if (!user) return response.error(500);

		await user.settings.sync();
		return response.json(user.settings.toJSON());
	}

	// TODO: This must be limited, not all keys are configurable.
	@authenticated
	@ratelimit(2, 1000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;

		const user = await this.client.users.fetch(request.auth!.user_id);
		if (!user) return response.error(500);

		const keys = Object.keys(requestBody.data);

		for (const key of keys) {
			const schemaForKey = this.client.gateways.get('users')!.schema.get(key) as SchemaEntry;
			if (!schemaForKey || !schemaForKey!.configurable) {
				return response.error(400);
			}
		}

		await user.settings.sync();


		const { updated, errors } = await user.settings.update(requestBody.data, { action: 'overwrite' });

		if (errors.length > 0) {
			this.client.emit(Events.Error,
				`${user.username}[${user.id}] failed user settings update:\n${inspect(errors)}`);

			return response.error(500);
		}

		return response.json(updated);
	}

}
