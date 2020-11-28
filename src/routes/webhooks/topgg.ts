import { DbSet } from '#lib/database/index';
import { ApiRequest } from '#lib/structures/api/ApiRequest';
import { ApiResponse } from '#lib/structures/api/ApiResponse';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'webhooks/topgg', route: 'webhooks/topgg' })
export default class extends Route {
	public async post(request: ApiRequest, response: ApiResponse) {
		if (request.headers.authorization !== TOKENS.WEBHOOK_TOPGG) return response.forbidden();
		if (!request.body) return response.badRequest();

		const body = request.body as Body;
		try {
			const { users } = await DbSet.connect();
			await users.lock([body.user], async (id) => {
				const user = await users.ensure(id);

				user.money += body.isWeekend ? 800 : 400;
				await user.save();
			});

			return response.noContent();
		} catch (error) {
			this.client.emit('error', error);
			return response.error(error.message || 'Unknown error');
		}
	}
}

interface Body {
	bot: string;
	user: string;
	type: 'upvote' | 'test';
	isWeekend: boolean;
	query?: string;
}
