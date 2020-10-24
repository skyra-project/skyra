import { Collection } from '@discordjs/collection';
import { RWLock } from 'async-rwlock';
import { Client } from 'discord.js';
import { BaseEntity } from 'typeorm';

export interface SettingsCollectionCallback<T extends BaseEntity, R> {
	(entity: T): R;
}

export abstract class SettingsCollection<T extends BaseEntity> extends Collection<string, T> {
	public readonly client: Client;
	private readonly lock = new RWLock();

	public constructor(client: Client) {
		super();
		this.client = client;
	}

	public async read<R>(key: string, cb: SettingsCollectionCallback<T, R>): Promise<R> {
		try {
			// Acquire a read lock:
			await this.lock.readLock();

			// Fetch the entry and pass it to the callback:
			const settings = this.get(key) ?? (await this.fetch(key));
			return await cb(settings);
		} finally {
			// Unlock the lock:
			this.lock.unlock();
		}
	}

	public async write<R>(key: string, cb: SettingsCollectionCallback<T, R>): Promise<R> {
		try {
			// Acquire a write lock:
			await this.lock.writeLock();

			// Fetch the entry, pass it to the callback, and save:
			const settings = this.get(key) ?? (await this.fetch(key));
			const result = await cb(settings);
			await settings.save();
			return result;
		} finally {
			this.lock.unlock();
		}
	}

	public abstract fetch(key: string): Promise<T>;
}
