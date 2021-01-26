import { authenticated, ratelimit } from '#lib/api/utils';
import { DbSet } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { inspect } from 'util';

interface BodyData {
	darkTheme?: boolean;
	moderationDM?: boolean;
}

@ApplyOptions<RouteOptions>({ name: 'userSettings', route: 'users/@me/settings' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(5, 1000, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(request.auth!.id);

		return response.json(user);
	}

	@authenticated()
	@ratelimit(2, 1000, true)
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { data: BodyData };

		const { users } = await DbSet.connect();
		const userID = request.auth!.id;

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
			this.context.client.logger.error(`[${userID}] failed user settings update:\n${inspect(errors)}`);

			return response.error(HttpCodes.InternalServerError);
		}
	}
}
