import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { authenticated } from '../../lib/util/util';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'users/@me' });
	}

	@authenticated
	public async get(request: ApiRequest, response: ApiResponse) {
		const user = await this.client.users.fetch(request.auth!.user_id);
		return user ? response.json(user.toJSON()) : response.error(500);
	}

}
