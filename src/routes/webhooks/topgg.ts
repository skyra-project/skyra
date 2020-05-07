import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { TOKENS } from '@root/config';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<RouteOptions>({ name: 'webhooks/topgg', route: 'webhooks/topgg' })
export default class extends Route {

	public async post(request: ApiRequest, response: ApiResponse) {
		if (request.headers.authorization !== TOKENS.WEBHOOK_B4D) return response.forbidden();
		if (!request.body) return response.badRequest();

		const body = request.body as Body;
		try {
			const user = await this.client.users.fetch(body.user);
			const settings = await user.settings.sync();
			const payment = body.isWeekend ? 600 : 400;

			await settings.increase(UserSettings.Money, payment);
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
