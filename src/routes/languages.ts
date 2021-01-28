import { ratelimit } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'languages' })
export default class extends Route {
	@ratelimit(2, 2500)
	public [methods.GET](_: ApiRequest, response: ApiResponse) {
		return response.json([...this.context.client.i18n.languages.keys()]);
	}
}
