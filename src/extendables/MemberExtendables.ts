// @ts-nocheck
import { Client, GuildMember } from 'discord.js';
import { ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [GuildMember] });
	}

	public async fetchRank() {
		const self = this as GuildMember;
		const list = await self.client.leaderboard.fetch(self.guild.id);
		const rank = list.get(self.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = self.user.username;
		return rank.position;
	}

}
