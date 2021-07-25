import type { Queue } from '#lib/audio';
import { ModerationManager, StickyRoleManager } from '#lib/moderation';
import { StarboardManager } from '#lib/structures';
import { GuildSecurity } from '#utils/Security/GuildSecurity';
import { Structures } from 'discord.js';

export class SkyraGuild extends Structures.get('Guild') {
	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly stickyRoles: StickyRoleManager = new StickyRoleManager(this);

	public get audio(): Queue {
		return this.client.audio!.queues.get(this.id);
	}
}

declare module 'discord.js' {
	export interface Guild {
		readonly audio: Queue;
		readonly security: GuildSecurity;
		readonly starboard: StarboardManager;
		readonly moderation: ModerationManager;
		readonly stickyRoles: StickyRoleManager;
	}
}

Structures.extend('Guild', () => SkyraGuild);
