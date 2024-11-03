import { ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { Route } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	@ratelimit(seconds(2), 2)
	public run(_request: Route.Request, response: Route.Response) {
		return response.json([...this.container.i18n.languages.keys()]);
	}
}
