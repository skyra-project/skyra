import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { authenticated } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: '' })
export default class extends Route {
	public get(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

	@authenticated()
	public post(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
