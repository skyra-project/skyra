import { DbSet } from '@lib/database';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { authenticated, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { inspect } from 'util';

interface BodyData {
	darkTheme?: boolean;
	moderationDM?: boolean;
}

@ApplyOptions<RouteOptions>({ name: 'userSettings', route: 'users/@me/settings' })
export default class extends Route {
	@authenticated()
	@ratelimit(5, 1000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(request.auth!.user_id);

		return response.json(user);
	}

	@authenticated()
	@ratelimit(2, 1000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { data: BodyData };

		const { users } = await DbSet.connect();
		const userID = request.auth!.user_id;

		try {
			const newSettings = await users.lock([userID], async (id) => {
				const user = await users.ensureProfile(id);

				if (requestBody.data.darkTheme) {
					if (typeof requestBody.data.darkTheme !== 'boolean') return response.badRequest('darkTheme must be a boolean');
					user.profile.darkTheme = requestBody.data.darkTheme;
				}

				if (requestBody.data.moderationDM) {
					if (typeof requestBody.data.moderationDM !== 'boolean') return response.badRequest('moderationDM must be a boolean');
					user.moderationDM = requestBody.data.moderationDM;
				}

				return user.save();
			});

			return response.json({ newSettings });
		} catch (errors) {
			this.client.emit(Events.Error, `[${userID}] failed user settings update:\n${inspect(errors)}`);

			return response.error(500);
		}
	}
}
