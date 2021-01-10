import { Queue } from '#lib/audio';
import { GuildEntity, SettingsCollectionCallback } from '#lib/database';
import { ModerationManager } from '#lib/structures/managers/ModerationManager';
import { StarboardManager } from '#lib/structures/managers/StarboardManager';
import { StickyRoleManager } from '#lib/structures/managers/StickyRoleManager';
import { CustomFunctionGet, CustomGet } from '#lib/types';
import { GuildSecurity } from '#utils/Security/GuildSecurity';
import { Primitive } from '@sapphire/utilities';
import type { GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Message, Structures } from 'discord.js';
import { TFunction } from 'i18next';

export class SkyraGuild extends Structures.get('Guild') {
	public readonly security: GuildSecurity = new GuildSecurity(this);
	public readonly starboard: StarboardManager = new StarboardManager(this);
	public readonly moderation: ModerationManager = new ModerationManager(this);
	public readonly stickyRoles: StickyRoleManager = new StickyRoleManager(this);

	public get audio(): Queue {
		return this.client.audio.queues!.get(this.id);
	}

	public async fetchLanguage() {
		const lang: string = await this.client.fetchLanguage(({ guild: this, channel: null } as unknown) as Message);
		return lang ?? this.preferredLocale ?? this.client.i18n.options?.defaultName ?? 'en-US';
	}

	public async fetchT(): Promise<TFunction> {
		return this.client.i18n.fetchT(await this.fetchLanguage());
	}

	public async resolveKey(key: string, ...values: readonly any[]): Promise<string> {
		return this.client.i18n.fetchLocale(await this.fetchLanguage(), key, ...values);
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
		readonly stickyRoles: StickyRoleManager;

		fetchLanguage(): Promise<string>;
		fetchT(): Promise<TFunction>;
		resolveKey<K extends string, TReturn>(value: CustomGet<K, TReturn>): Promise<TReturn>;
		resolveKey<K extends string, TArgs, TReturn>(
			value: CustomFunctionGet<K, TArgs, TReturn>,
			args: TArgs
		): Promise<TReturn extends Primitive | any[] ? TReturn : never>;

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
