/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Structures } from 'discord.js';

export class SkyraGuildMember extends Structures.get('GuildMember') {
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

Structures.extend('GuildMember', () => SkyraGuildMember);
