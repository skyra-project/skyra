import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Mime } from '@utils/constants';
import { Middleware, MiddlewareStore } from 'klasa-dashboard-hooks';
import { DOMAIN } from '@root/config';

export default class extends Middleware {

	public constructor(store: MiddlewareStore, file: string[], directory: string) {
		super(store, file, directory, { priority: 10 });
	}

	public run(request: ApiRequest, response: ApiResponse) {
		response.setHeader('Access-Control-Allow-Origin', DOMAIN);
		response.setHeader('Access-Control-Allow-Credentials', 'true');
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');
		response.setHeader('Content-Type', `${Mime.Types.ApplicationJson}; charset=utf-8`);
		if (request.method === 'OPTIONS') response.noContent();
	}

}
