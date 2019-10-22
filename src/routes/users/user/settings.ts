import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { inspect } from 'util';
import ApiRequest from '../../../lib/structures/api/ApiRequest';
import ApiResponse from '../../../lib/structures/api/ApiResponse';
import { Events } from '../../../lib/types/Enums';
import { ApplyOptions, authenticated, ratelimit } from '../../../lib/util/util';

@ApplyOptions<RouteOptions>({
	name: 'userSettings',
	route: 'users/@me/settings'
})
export default class extends Route {

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
