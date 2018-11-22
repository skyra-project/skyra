import { Collection, Structures } from 'discord.js';
import { KlasaGuild, Settings } from 'klasa';
import { GuildSecurity, ModerationManager, StarboardManager } from '../..';
import { SkyraClient } from '../SkyraClient';
import { enumerable } from '../util/util';
import { SkyraGuildMember } from './SkyraGuildMember';

import ModerationManager from '../structures/ModerationManager';
import StarboardManager from '../structures/StarboardManager';
import GuildSecurity from '../util/GuildSecurity';

export class SkyraGuild extends KlasaGuild {
	public security = new GuildSecurity(this);
	public starboard = new StarboardManager(this);
	public moderation = new ModerationManager(this);

	@enumerable(false)
	public memberSnowflakes: Set<string> = new Set();

	public get memberTags(): Collection<string, string> {
		const collection = new Collection();
		for (const snowflake of this.memberSnowflakes) {
			// @ts-ignore
			const username = this.client.usernames.get(snowflake);
			if (username) collection.set(snowflake, username);
		}
		return collection;
	}

	public get memberUsernames(): Collection<string, string> {
		const collection = new Collection();
		for (const snowflake of this.memberSnowflakes) {
			// @ts-ignore
			const username = this.client.usernames.get(snowflake);
			if (username) collection.set(snowflake, username.slice(0, username.indexOf('#')));
		}
		return collection;
	}

}

declare module 'discord.js' {
	export interface Guild {
		security: GuildSecurity;
		starboard: StarboardManager;
		moderation: ModerationManager;
		memberSnowflakes: Set<string>;
		memberTags: Collection<string, string>;
		memberUsernames: Collection<string, string>;
		settings: MemberSettings;
	}
}

Structures.extend('Guild', () => SkyraGuild);
