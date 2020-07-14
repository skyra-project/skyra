import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Databases } from '@lib/types/constants/Constants';
import { ratelimit } from '@utils/util';
import { Route, RouteStore } from 'klasa-dashboard-hooks';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'guilds/schema' });
	}

	@ratelimit(2, 5000)
	public get(_request: ApiRequest, response: ApiResponse) {
		const gateway = this.client.gateways.get(Databases.Guild)!;
		return response.json(gateway.schema.toJSON());
	}

}
