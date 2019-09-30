import fetch from 'node-fetch';
import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { ratelimit } from '../../lib/util/util';

export default class extends Route {


	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/user' });
	}

	@ratelimit(2, 60000)
	public async api(token: string) {
		token = `Bearer ${token}`;
		const user = await fetch('https://discordapp.com/api/users/@me', { headers: { Authorization: token } })
			.then(result => result.json());
		user.guilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } })
			.then(result => result.json());
		return this.client.dashboardUsers.add(user);
	}

}
