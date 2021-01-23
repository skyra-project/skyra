import { DbSet } from '#lib/database';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'webhooks/topgg', route: 'webhooks/topgg' })
export default class extends Route {
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
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
			this.context.client.logger.error(error);
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
