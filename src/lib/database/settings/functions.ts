import { GuildEntity } from '#lib/database/entities/GuildEntity';
import type { GuildData, ReadonlyGuildData, ReadonlyGuildEntity } from '#lib/database/settings/types';
import { container, type Awaitable } from '@sapphire/framework';
import { objectKeys } from '@sapphire/utilities';
import { RWLock } from 'async-rwlock';
import { Collection, type GuildResolvable, type Snowflake } from 'discord.js';

const cache = new Collection<string, GuildEntity>();
const queue = new Collection<string, Promise<GuildEntity>>();
const locks = new Collection<string, RWLock>();

export function deleteSettingsCached(guild: GuildResolvable) {
	const id = resolveGuildId(guild);
	locks.delete(id);
	cache.delete(id);
}

export async function readSettings(guild: GuildResolvable): Promise<ReadonlyGuildEntity> {
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

export function readSettingsCached(guild: GuildResolvable): ReadonlyGuildEntity | null {
	return cache.get(resolveGuildId(guild)) ?? null;
}

export async function writeSettings(
	guild: GuildResolvable,
	data: Partial<ReadonlyGuildEntity> | ((settings: ReadonlyGuildEntity) => Awaitable<Partial<ReadonlyGuildEntity>>)
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
		public readonly settings: ReadonlyGuildEntity,
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

		const original = this.#getOriginalValues();
		try {
			Object.assign(this.settings, this.#changes);
			await this.settings.save();
			this.#hasChanges = false;
		} catch (error) {
			Object.assign(this.settings, original);
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

	#getOriginalValues() {
		const data = Object.assign(Object.create(null), this.#changes) as Partial<GuildData>;
		for (const key of objectKeys(data)) {
			// @ts-expect-error Complex types
			data[key] = this.settings[key];
		}

		return data;
	}
}

async function unlockOnThrow(promise: Promise<GuildEntity>, lock: RWLock) {
	try {
		return await promise;
	} catch (error) {
		lock.unlock();
		throw error;
	}
}

async function processFetch(id: string): Promise<GuildEntity> {
	const previous = queue.get(id);
	if (previous) return previous;

	try {
		const promise = fetch(id);
		queue.set(id, promise);
		return await promise;
	} finally {
		queue.delete(id);
	}
}

async function fetch(id: string): Promise<GuildEntity> {
	const { guilds } = container.db;
	const existing = await guilds.findOne({ where: { id } });
	if (existing) {
		cache.set(id, existing);
		return existing;
	}

	const created = new GuildEntity();
	created.id = id;
	cache.set(id, created);
	return created;
}

function resolveGuildId(guild: GuildResolvable): Snowflake {
	const resolvedId = container.client.guilds.resolveId(guild);
	if (resolvedId === null) throw new TypeError(`Cannot resolve "guild" to a Guild instance.`);
	return resolvedId;
}
