import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public async fetchRank(this: User) {
		const list = await this.client.leaderboard.fetch();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}
}
