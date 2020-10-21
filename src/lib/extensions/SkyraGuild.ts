/* eslint-disable @typescript-eslint/no-invalid-this */
import { Queue } from '@lib/audio';
import { ModerationManager } from '@lib/structures/managers/ModerationManager';
import { PermissionsManager } from '@lib/structures/managers/PermissionsManager';
import { StarboardManager } from '@lib/structures/managers/StarboardManager';
import { StickyRoleManager } from '@lib/structures/managers/StickyRoleManager';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Structures } from 'discord.js';

export class SkyraGuild extends Structures.get('Guild') {
	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly permissionsManager: PermissionsManager = new PermissionsManager(this);
	public readonly stickyRoles: StickyRoleManager = new StickyRoleManager(this);

	public get audio(): Queue {
		return this.client.audio.queues!.get(this.id);
	}
}

declare module 'discord.js' {
	export interface Guild {
		readonly audio: Queue;
		readonly security: GuildSecurity;
		readonly starboard: StarboardManager;
		readonly moderation: ModerationManager;
		readonly permissionsManager: PermissionsManager;
		readonly stickyRoles: StickyRoleManager;

		_patch(data: GatewayGuildCreateDispatch['d'] & { shardID: number }): void;
	}
}

Structures.extend('Guild', () => SkyraGuild);
