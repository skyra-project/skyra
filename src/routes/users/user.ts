import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { authenticated, ratelimit } from '../../lib/util/util';
import { flattenUser } from '../../lib/util/Models/ApiTransform';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'users/@me' });
	}

	@authenticated
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id);
		return user ? response.json(flattenUser(user)) : response.error(500);
	}

}
