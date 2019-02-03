// @ts-nocheck
import { Client, User } from 'discord.js';
import { ExtendableStore } from 'klasa';
import { UserSettings } from '../lib/types/namespaces/UserSettings';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [User] });
	}

	public get profileLevel() {
		return Math.floor(0.2 * Math.sqrt(this.get(UserSettings.Points) as UserSettings.Points));
	}

	public async fetchRank() {
		const list = await this.client.leaderboard.getUsers();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}

}
