import { Structures } from 'discord.js';
import { enumerable } from '@utils/util';

import { ModerationManager } from '@lib/structures/ModerationManager';
import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { PermissionsManager } from '@lib/structures/PermissionsManager';
import { StarboardManager } from '@lib/structures/StarboardManager';
import { MemberTags } from '@utils/Cache/MemberTags';
import { GuildSecurity } from '@utils/Security/GuildSecurity';

export class SkyraGuild extends Structures.get('Guild') {

	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly permissionsManager: PermissionsManager = new PermissionsManager(this);
	public readonly music: MusicHandler = new MusicHandler(this);

	@enumerable(false)
	public readonly memberTags: MemberTags = new MemberTags(this);

}

declare module 'discord.js' {
	export interface Guild {
		readonly security: GuildSecurity;
		readonly starboard: StarboardManager;
		readonly moderation: ModerationManager;
		readonly permissionsManager: PermissionsManager;
		readonly music: MusicHandler;
		readonly memberTags: MemberTags;
	}
}

Structures.extend('Guild', () => SkyraGuild);
