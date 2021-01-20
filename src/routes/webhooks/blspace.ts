import { DbSet } from '#lib/database';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'webhooks/blspace', route: 'webhooks/blspace' })
export default class extends Route {
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
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
			this.context.client.emit('error', error);
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
