import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import fetch from 'node-fetch';
import { ApplyOptions } from '../../lib/util/util';

@ApplyOptions<RouteOptions>({
	route: 'oauth/user'
})
export default class extends Route {

	public async api(token: string) {
		token = `Bearer ${token}`;
		const user = await fetch('https://discordapp.com/api/users/@me', { headers: { Authorization: token } })
			.then(result => result.json());
		user.guilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } })
			.then(result => result.json());
		return this.client.dashboardUsers.add(user);
	}

}
