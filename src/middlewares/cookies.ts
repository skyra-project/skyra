import { Middleware, MiddlewareStore } from 'klasa-dashboard-hooks';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { CookieStore } from '@lib/structures/api/CookieStore';
import { DEV } from '@root/config';

export default class extends Middleware {

	public constructor(store: MiddlewareStore, file: string[], directory: string) {
		super(store, file, directory, { priority: 30 });
	}

	public run(request: ApiRequest, response: ApiResponse) {
		response.cookies = new CookieStore(request, response, !DEV);
	}

}
