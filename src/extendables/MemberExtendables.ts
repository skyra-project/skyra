// @ts-nocheck
import { Client, GuildMember } from 'discord.js';
import { ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [GuildMember] });
	}

	public async fetchRank(): Promise<number> {
		const list = await this.client.leaderboard.getMembers(this.guild.id);
		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.user.username;
		return rank.position;
	}

}

declare module 'discord.js' {
	export interface GuildMember {
		fetchRank(): Promise<number>;
	}
}
