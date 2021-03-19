import { DbSet } from '#lib/database';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'webhooks/b4d', route: 'webhooks/b4d' })
export class UserRoute extends Route {
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		if (request.headers.authorization !== TOKENS.WEBHOOK_B4D) return response.forbidden();
		if (!request.body) return response.badRequest();

		const body = request.body as Body;
		try {
			const { users } = this.context.db;
			await users.lock([body.user], async (id) => {
				const user = await users.ensure(id);

				user.money += body.votes.totalVotes % 5 === 0 ? 1200 : 400;
				await user.save();
			});

			return response.noContent();
		} catch (error) {
			this.context.client.logger.error(error);
			return response.error(error.message ?? 'Unknown error');
		}
	}
}

interface Body {
	user: string;
	bot: string;
	votes: BodyVotes;
	type: 'vote' | 'test';
}

interface BodyVotes {
	totalVotes: number;
	votes24: number;
	votesMonth: number;
	hasVoted: string[];
	hasVoted24: string[];
}
