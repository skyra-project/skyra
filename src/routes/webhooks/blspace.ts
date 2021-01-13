import { DbSet } from '#lib/database';
import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'webhooks/blspace', route: 'webhooks/blspace' })
export default class extends Route {
	public async post(request: ApiRequest, response: ApiResponse) {
		if (request.headers.authorization !== TOKENS.BOTLIST_SPACE_KEY) return response.forbidden();
		if (!request.body) return response.badRequest();

		const body = request.body as Body;
		try {
			const { users } = await DbSet.connect();
			await users.lock([body.user.id], async (id) => {
				const user = await users.ensure(id);

				user.money += 400;
				await user.save();
			});

			return response.noContent();
		} catch (error) {
			this.client.emit('error', error);
			return response.error(error.message ?? 'Unknown error');
		}
	}
}

export interface Body {
	site: 'botlist.space';
	bot: string;
	user: BodyUser;
	timestamp: number;
}

export interface BodyUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	short_description: string | null;
}
