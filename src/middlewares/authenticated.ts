import { ApiRequest, UserAuthObject } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Middleware, MiddlewareStore, Route, Util } from 'klasa-dashboard-hooks';

export default class extends Middleware {

	public constructor(store: MiddlewareStore, file: string[], directory: string) {
		super(store, file, directory, { priority: 100 });
	}

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
