/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Structures } from 'discord.js';

export class SkyraUser extends Structures.get('User') {
	// Remove when https://github.com/discordjs/discord.js/pull/4932 lands.
	// @ts-expect-error: Setter-Getter combo to make the property never be set.
	public set locale(_: string | null) {
		// noop
	}

	public get locale() {
		return null;
	}

	// @ts-expect-error: Setter-Getter combo to make the property never be set.
	public set lastMessageID(_: string | null) {
		// noop
	}

	public get lastMessageID() {
		return null;
	}

	public set lastMessageChannelID(_: string | null) {
		// noop
	}

	public get lastMessageChannelID() {
		return null;
	}

	public async fetchRank() {
		const list = await this.client.leaderboard.fetch();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}
}

declare module 'discord.js' {
	export interface User {
		fetchRank(): Promise<number>;
	}
}

Structures.extend('User', () => SkyraUser);
