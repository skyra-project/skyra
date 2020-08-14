import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Databases } from '@lib/types/constants/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'guilds/schema' })
export default class extends Route {
	@ratelimit(2, 5000)
	public get(_request: ApiRequest, response: ApiResponse) {
		const gateway = this.client.gateways.get(Databases.Guild)!;
		return response.json(gateway.schema.toJSON());
	}
}
