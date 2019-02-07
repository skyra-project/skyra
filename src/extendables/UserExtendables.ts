import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [User] });
	}

	public get profileLevel() {
		const self = this as unknown as User;
		return Math.floor(0.2 * Math.sqrt(self.settings.get(UserSettings.Points) as UserSettings.Points));
	}

	public async fetchRank() {
		const self = this as unknown as User;
		const list = await self.client.leaderboard.fetch();

		const rank = list.get(self.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = self.username;
		return rank.position;
	}

}
