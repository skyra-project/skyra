import { Client, User } from 'discord.js';

export class UserManagerStore extends Set<string> {

	public client: Client;

	public constructor(client: Client) {
		super();
		this.client = client;
	}

	public fetch() {
		const promises = [] as Promise<User>[];
		for (const user of this) promises.push(this.client.users.fetch(user));
		return Promise.all(promises);
	}

}
