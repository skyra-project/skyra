/* eslint-disable @typescript-eslint/no-invalid-this */
import { Queue } from '@lib/audio';
import { GuildEntity, SettingsCollectionCallback } from '@lib/database';
import { ModerationManager } from '@lib/structures/managers/ModerationManager';
import { PermissionsManager } from '@lib/structures/managers/PermissionsManager';
import { StarboardManager } from '@lib/structures/managers/StarboardManager';
import { StickyRoleManager } from '@lib/structures/managers/StickyRoleManager';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import type { GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Guild, Structures } from 'discord.js';
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

	public fetchLanguage(this: Guild): Promise<Language> {
		return this.readSettings((entity) => this.client.languages.get(entity.language)!);
	}

	public readSettings(...args: readonly [any]): Promise<any> {
		return this.client.settings.guilds.read(this.id, ...args);
	}

	public writeSettings(...args: readonly [any]): Promise<any> {
		return this.client.settings.guilds.write(this.id, ...args);
	}
}

type T = GuildEntity;

declare module 'discord.js' {
	export interface Guild {
		readonly audio: Queue;
		readonly security: GuildSecurity;
		readonly starboard: StarboardManager;
		readonly moderation: ModerationManager;
		readonly permissionsManager: PermissionsManager;
		readonly stickyRoles: StickyRoleManager;
		fetchLanguage(): Promise<Language>;

		readSettings<K1 extends keyof T>(paths: readonly [K1]): Promise<[T[K1]]>;
		readSettings<K1 extends keyof T, K2 extends keyof T>(paths: readonly [K1, K2]): Promise<[T[K1], T[K2]]>;
		readSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T>(paths: readonly [K1, K2, K3]): Promise<[T[K1], T[K2], T[K3]]>;
		readSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T>(
			paths: readonly [K1, K2, K3, K4]
		): Promise<[T[K1], T[K2], T[K3], T[K4]]>;
		readSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T, K5 extends keyof T>(
			paths: readonly [K1, K2, K3, K4, K5]
		): Promise<[T[K1], T[K2], T[K3], T[K4], T[K5]]>;
		readSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T, K5 extends keyof T, K6 extends keyof T>(
			paths: readonly [K1, K2, K3, K4, K5, K6]
		): Promise<[T[K1], T[K2], T[K3], T[K4], T[K5], T[K6]]>;
		readSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T
		>(
			paths: readonly [K1, K2, K3, K4, K5, K6, K7]
		): Promise<[T[K1], T[K2], T[K3], T[K4], T[K5], T[K6], T[K7]]>;
		readSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T,
			K8 extends keyof T
		>(
			paths: readonly [K1, K2, K3, K4, K5, K6, K7, K8]
		): Promise<[T[K1], T[K2], T[K3], T[K4], T[K5], T[K6], T[K7], T[K8]]>;
		readSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T,
			K8 extends keyof T,
			K9 extends keyof T
		>(
			paths: readonly [K1, K2, K3, K4, K5, K6, K7, K8, K9]
		): Promise<[T[K1], T[K2], T[K3], T[K4], T[K5], T[K6], T[K7], T[K8], T[K9]]>;
		readSettings<K extends keyof T>(paths: readonly K[]): Promise<T[K][]>;
		readSettings<K extends keyof T>(path: K): Promise<T[K]>;
		readSettings<R>(cb: SettingsCollectionCallback<T, R>): Promise<R>;

		writeSettings<K1 extends keyof T>(pairs: readonly [[K1, T[K1]]]): Promise<void>;
		writeSettings<K1 extends keyof T, K2 extends keyof T>(pairs: readonly [[K1, T[K1]], [K2, T[K2]]]): Promise<void>;
		writeSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]]]
		): Promise<void>;
		writeSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]]]
		): Promise<void>;
		writeSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T, K5 extends keyof T>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]], [K5, T[K5]]]
		): Promise<void>;
		writeSettings<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T, K4 extends keyof T, K5 extends keyof T, K6 extends keyof T>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]], [K5, T[K5]], [K6, T[K6]]]
		): Promise<void>;
		writeSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T
		>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]], [K5, T[K5]], [K6, T[K6]], [K7, T[K7]]]
		): Promise<void>;
		writeSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T,
			K8 extends keyof T
		>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]], [K5, T[K5]], [K6, T[K6]], [K7, T[K7]], [K8, T[K8]]]
		): Promise<void>;
		writeSettings<
			K1 extends keyof T,
			K2 extends keyof T,
			K3 extends keyof T,
			K4 extends keyof T,
			K5 extends keyof T,
			K6 extends keyof T,
			K7 extends keyof T,
			K8 extends keyof T,
			K9 extends keyof T
		>(
			pairs: readonly [[K1, T[K1]], [K2, T[K2]], [K3, T[K3]], [K4, T[K4]], [K5, T[K5]], [K6, T[K6]], [K7, T[K7]], [K8, T[K8]], [K9, T[K9]]]
		): Promise<void>;
		writeSettings<K extends keyof T>(pairs: readonly [K, T[K]][]): Promise<void>;
		writeSettings<R>(cb: SettingsCollectionCallback<T, R>): Promise<R>;

		_patch(data: GatewayGuildCreateDispatch['d'] & { shardID: number }): void;
	}
}

Structures.extend('Guild', () => SkyraGuild);
