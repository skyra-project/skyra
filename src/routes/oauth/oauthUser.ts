import fetch from 'node-fetch';
import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { ratelimit, authenticated } from '../../lib/util/util';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';

export default class extends Route {


	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/user' });
	}

	public async api(token: string) {
		token = `Bearer ${token}`;
		const user = await fetch('https://discordapp.com/api/users/@me', { headers: { Authorization: token } })
			.then(result => result.json());
		user.guilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } })
			.then(result => result.json());
		return this.client.dashboardUsers.add(user);
	}

	@authenticated
	@ratelimit(1, 5000, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (!requestBody.action) {
			return response.error(400);
		}

		if (requestBody.action === 'SYNC_USER') {
			const user = await this.api(request.auth!.token);
			return response.json({ user });
		}

		return response.error(400);
	}

}
