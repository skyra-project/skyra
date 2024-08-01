import { getDefaultGuildSettings } from '#lib/database/settings/constants';
import { deleteSettingsContext, getSettingsContext, updateSettingsContext } from '#lib/database/settings/context/functions';
import type { AdderKey } from '#lib/database/settings/structures/AdderManager';
import type { GuildData, ReadonlyGuildData } from '#lib/database/settings/types';
import { container, type Awaitable } from '@sapphire/framework';
import { RWLock } from 'async-rwlock';
import { Collection, type GuildResolvable, type Snowflake } from 'discord.js';

const cache = new Collection<string, GuildData>();
const queue = new Collection<string, Promise<GuildData>>();
const locks = new Collection<string, RWLock>();

export function deleteSettingsCached(guild: GuildResolvable) {
	const id = resolveGuildId(guild);
	locks.delete(id);
	cache.delete(id);
	deleteSettingsContext(id);
}

export async function readSettings(guild: GuildResolvable): Promise<ReadonlyGuildData> {
	const id = resolveGuildId(guild);

	const lock = locks.ensure(id, () => new RWLock());
	try {
		// Acquire a read lock:
		await lock.readLock();

		// Fetch the entry:
		return cache.get(id) ?? (await processFetch(id));
	} finally {
		// Unlock the lock:
		lock.unlock();
	}
}

export function readSettingsAdder(settings: ReadonlyGuildData, key: AdderKey) {
	return getSettingsContext(settings).adders[key];
}

export function readSettingsPermissionNodes(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).permissionNodes;
}

export function readSettingsNoMentionSpam(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).noMentionSpam;
}

export function readSettingsWordFilterRegExp(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).wordFilterRegExp;
}

export function readSettingsCached(guild: GuildResolvable): ReadonlyGuildData | null {
	return cache.get(resolveGuildId(guild)) ?? null;
}

export async function writeSettings(
	guild: GuildResolvable,
	data: Partial<ReadonlyGuildData> | ((settings: ReadonlyGuildData) => Awaitable<Partial<ReadonlyGuildData>>)
) {
	using trx = await writeSettingsTransaction(guild);

	if (typeof data === 'function') {
		data = await data(trx.settings);
	}

	await trx.write(data).submit();
}

export async function writeSettingsTransaction(guild: GuildResolvable) {
	const id = resolveGuildId(guild);
	const lock = locks.ensure(id, () => new RWLock());

	// Acquire a write lock:
	await lock.writeLock();

	// Fetch the entry:
	const settings = cache.get(id) ?? (await unlockOnThrow(processFetch(id), lock));

	return new Transaction(settings, lock);
}

export class Transaction {
	#changes = Object.create(null) as Partial<ReadonlyGuildData>;
	#hasChanges = false;
	#locking = true;

	public constructor(
		public readonly settings: ReadonlyGuildData,
		private readonly lock: RWLock
	) {}

	public get hasChanges() {
		return this.#hasChanges;
	}

	public get locking() {
		return this.#locking;
	}

	public write(data: Partial<ReadonlyGuildData>) {
		Object.assign(this.#changes, data);
		this.#hasChanges = true;
		return this;
	}

	public async submit() {
		if (!this.#hasChanges) {
			throw new Error('Cannot submit a transaction without changes');
		}

		try {
			await container.prisma.guild.update({
				where: { id: this.settings.id },
				// @ts-expect-error readonly
				data: this.#changes
			});

			Object.assign(this.settings, this.#changes);
			this.#hasChanges = false;
			updateSettingsContext(this.settings, this.#changes);
		} catch (error) {
			throw error;
		} finally {
			this.#changes = Object.create(null);

			if (this.#locking) {
				this.lock.unlock();
				this.#locking = false;
			}
		}
	}

	public abort() {
		if (this.#locking) {
			this.lock.unlock();
			this.#locking = false;
		}
	}

	public dispose() {
		if (this.#locking) {
			this.lock.unlock();
			this.#locking = false;
		}
	}

	public [Symbol.dispose]() {
		return this.dispose();
	}
}

async function unlockOnThrow(promise: Promise<ReadonlyGuildData>, lock: RWLock) {
	try {
		return await promise;
	} catch (error) {
		lock.unlock();
		throw error;
	}
}

async function processFetch(id: string): Promise<ReadonlyGuildData> {
	const previous = queue.get(id);
	if (previous) return previous;

	try {
		const promise = fetch(id);
		queue.set(id, promise);
		const value = await promise;
		getSettingsContext(value);
		return value;
	} finally {
		queue.delete(id);
	}
}

async function fetch(id: string): Promise<GuildData> {
	const { guild } = container.prisma;
	const existing = await guild.findUnique({ where: { id } });
	if (existing) {
		cache.set(id, existing);
		return existing;
	}

	const created = Object.create(getDefaultGuildSettings(), {
		id: { value: id, writable: false, configurable: false, enumerable: true }
	}) as GuildData;
	cache.set(id, created);
	return created;
}

function resolveGuildId(guild: GuildResolvable): Snowflake {
	const resolvedId = container.client.guilds.resolveId(guild);
	if (resolvedId === null) throw new TypeError(`Cannot resolve "guild" to a Guild instance.`);
	return resolvedId;
}
