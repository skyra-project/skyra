/* eslint-disable @typescript-eslint/no-invalid-this */
import { Queue } from '@lib/audio';
import { GuildSettingsCollectionCallback } from '@lib/database';
import { ModerationManager } from '@lib/structures/managers/ModerationManager';
import { PermissionsManager } from '@lib/structures/managers/PermissionsManager';
import { StarboardManager } from '@lib/structures/managers/StarboardManager';
import { StickyRoleManager } from '@lib/structures/managers/StickyRoleManager';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import type { GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Structures } from 'discord.js';
import type { Language } from 'klasa';

export class SkyraGuild extends Structures.get('Guild') {
	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly permissionsManager: PermissionsManager = new PermissionsManager(this);
	public readonly stickyRoles: StickyRoleManager = new StickyRoleManager(this);

	public get audio(): Queue {
		return this.client.audio.queues!.get(this.id);
	}

	public fetchLanguage(): Promise<Language> {
		return this.readSettings((entity) => this.client.languages.get(entity.language)!);
	}

	public readSettings<R>(cb: GuildSettingsCollectionCallback<R>): Promise<R> {
		return this.client.settings.guilds.read(this.id, cb);
	}

	public writeSettings<R>(cb: GuildSettingsCollectionCallback<R>): Promise<R> {
		return this.client.settings.guilds.write(this.id, cb);
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
		fetchLanguage(): Promise<Language>;
		readSettings<R>(cb: GuildSettingsCollectionCallback<R>): Promise<R>;
		writeSettings<R>(cb: GuildSettingsCollectionCallback<R>): Promise<R>;

		_patch(data: GatewayGuildCreateDispatch['d'] & { shardID: number }): void;
	}
}

Structures.extend('Guild', () => SkyraGuild);
