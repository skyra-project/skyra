import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { Databases } from '../../lib/types/constants/Constants';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'guilds/schema' });
	}

	public get(_request: ApiRequest, response: ApiResponse) {
		const gateway = this.client.gateways.get(Databases.Guilds)!;
		return response.json(gateway.schema.toJSON());
	}

}
