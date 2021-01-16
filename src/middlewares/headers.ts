import type { ApiRequest } from '#lib/api/ApiRequest';
import type { ApiResponse } from '#lib/api/ApiResponse';
import { DOMAIN } from '#root/config';
import { Mime } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<MiddlewareOptions>({ priority: 10 })
export default class extends Middleware {
	public run(request: ApiRequest, response: ApiResponse) {
		response.setHeader('Access-Control-Allow-Origin', DOMAIN);
		response.setHeader('Access-Control-Allow-Credentials', 'true');
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');
		response.setHeader('Content-Type', `${Mime.Types.ApplicationJson}; charset=utf-8`);
		if (request.method === 'OPTIONS') response.noContent();
	}
}
