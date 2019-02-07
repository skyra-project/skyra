import { GuildMember } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [GuildMember] });
	}

	public async fetchRank() {
		const self = this as unknown as GuildMember;
		const list = await self.client.leaderboard.fetch(self.guild.id);
		const rank = list.get(self.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = self.user.username;
		return rank.position;
	}

}
