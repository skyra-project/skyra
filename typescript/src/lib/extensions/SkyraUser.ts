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
}

Structures.extend('User', () => SkyraUser);
