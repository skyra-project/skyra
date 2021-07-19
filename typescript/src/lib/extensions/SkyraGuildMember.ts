/* eslint-disable @typescript-eslint/class-literal-property-style */
import type { GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v6';
import { Structures } from 'discord.js';

export class SkyraGuildMember extends Structures.get('GuildMember') {
	public async fetchRank() {
		const list = await this.client.leaderboard.fetch(this.guild.id);
		const rank = list.get(this.id);
		if (!rank) return list.size;
		return rank.position;
	}

	public set lastMessageID(_: string | null) {
		// noop
	}

	public get lastMessageID() {
		return null;
	}

	// @ts-expect-error: Setter-Getter combo to make the property never be set.
	public set lastMessageChannelID(_: string | null) {
		// noop
	}

	public get lastMessageChannelID() {
		return null;
	}
}

declare module 'discord.js' {
	export interface GuildMember {
		fetchRank(): Promise<number>;
		_patch(data: GatewayGuildMemberUpdateDispatch['d']): void;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
