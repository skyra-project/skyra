import { Structures } from 'discord.js';
import { enumerable } from '../util/util';

import { ModerationManager } from '../structures/ModerationManager';
import { Queue } from '../structures/music/Queue';
import { StarboardManager } from '../structures/StarboardManager';
import { GuildSecurity } from '../util/Security/GuildSecurity';
import { PermissionsManager } from '../structures/PermissionsManager';
import { MemberNicknames } from '../util/Cache/MemberNicknames';

export class SkyraGuild extends Structures.get('Guild') {

	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly permissionsManager: PermissionsManager = new PermissionsManager(this);
	public readonly music: Queue = new Queue(this);

	@enumerable(false)
	public readonly nicknames: MemberNicknames = new MemberNicknames(this);

}

declare module 'discord.js' {
	export interface Guild {
		readonly security: GuildSecurity;
		readonly starboard: StarboardManager;
		readonly moderation: ModerationManager;
		readonly permissionsManager: PermissionsManager;
		readonly music: Queue;
		readonly nicknames: MemberNicknames;
	}
}

Structures.extend('Guild', () => SkyraGuild);
