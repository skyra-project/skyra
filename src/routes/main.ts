import { authenticated } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: '' })
export default class extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

	@authenticated()
	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
