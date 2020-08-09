import { ApiRequest, UserAuthObject } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { Middleware, MiddlewareOptions, Route, Util } from 'klasa-dashboard-hooks';

@ApplyOptions<MiddlewareOptions>({ priority: 100 })
export default class extends Middleware {
	public run(request: ApiRequest, response: ApiResponse, route?: Route) {
		if (!route) return;

		const authorization = response.cookies.get('SKYRA_AUTH');
		if (authorization) {
			request.auth = Util.decrypt(authorization, this.client.options.clientSecret) as UserAuthObject;
		} else if (route.authenticated) {
			response.unauthorized();
		}
	}
}
