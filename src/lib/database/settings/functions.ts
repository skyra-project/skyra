import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import type { SettingsCollectionCallback } from '#lib/database/settings/base/SettingsCollection';
import { container } from '@sapphire/framework';
import type { GuildResolvable } from 'discord.js';

type K = keyof V;
type V = GuildEntity;

export function readSettings(guild: GuildResolvable) {
	const resolved = container.client.guilds.resolveId(guild);
	if (resolved === null) throw new TypeError(`Cannot resolve "guild" to a Guild instance.`);
	return container.settings.guilds.read(resolved);
}

export function writeSettings<K1 extends K>(guild: GuildResolvable, pairs: readonly [[K1, V[K1]]]): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K>(guild: GuildResolvable, pairs: readonly [[K1, V[K1]], [K2, V[K2]]]): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]]]
): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K, K4 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]]]
): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K, K4 extends K, K5 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]], [K5, V[K5]]]
): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K, K4 extends K, K5 extends K, K6 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]], [K5, V[K5]], [K6, V[K6]]]
): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K, K4 extends K, K5 extends K, K6 extends K, K7 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]], [K5, V[K5]], [K6, V[K6]], [K7, V[K7]]]
): Promise<void>;
export function writeSettings<K1 extends K, K2 extends K, K3 extends K, K4 extends K, K5 extends K, K6 extends K, K7 extends K, K8 extends K>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]], [K5, V[K5]], [K6, V[K6]], [K7, V[K7]], [K8, V[K8]]]
): Promise<void>;
export function writeSettings<
	K1 extends K,
	K2 extends K,
	K3 extends K,
	K4 extends K,
	K5 extends K,
	K6 extends K,
	K7 extends K,
	K8 extends K,
	K9 extends K
>(
	guild: GuildResolvable,
	pairs: readonly [[K1, V[K1]], [K2, V[K2]], [K3, V[K3]], [K4, V[K4]], [K5, V[K5]], [K6, V[K6]], [K7, V[K7]], [K8, V[K8]], [K9, V[K9]]]
): Promise<void>;
export function writeSettings<KX extends K>(guild: GuildResolvable, pairs: readonly [KX, V[KX]][]): Promise<void>;
export function writeSettings<R>(guild: GuildResolvable, cb: SettingsCollectionCallback<V, R>): Promise<R>;
export function writeSettings(guild: GuildResolvable, paths: any) {
	const resolved = container.client.guilds.resolveId(guild);
	if (resolved === null) throw new TypeError(`Cannot resolve "guild" to a Guild instance.`);
	return container.settings.guilds.write(resolved, paths);
}
