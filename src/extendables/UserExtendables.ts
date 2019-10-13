import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public get profileLevel(this: User) {
		return Math.floor(0.2 * Math.sqrt(this.settings.get(UserSettings.Points)));
	}

	public async fetchRank(this: User) {
		const list = await this.client.leaderboard.fetch();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}

}
