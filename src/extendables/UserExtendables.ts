import { User } from 'discord.js';
import { Extendable, ExtendableOptions } from 'klasa';
import { UserSettings } from '../lib/types/settings/UserSettings';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<ExtendableOptions>({
	appliesTo: [User]
})
export default class extends Extendable {

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
