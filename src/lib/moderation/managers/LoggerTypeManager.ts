import type { LoggerManager } from '#lib/moderation/managers/LoggerManager';
import { createReferPromise, type ReferredPromise } from '#utils/common';
import { Time } from '@sapphire/time-utilities';
import { Collection, type Snowflake } from 'discord.js';

/**
 * A manager to handle cross-piece data sharing for logs. This structure has two
 * main purposes:
 *
 * - Pass context data from the moderation system to a listener.
 * - Pass context data from audit logs to a listener.
 *
 * The listener will wait for the context data to be set, and either of two
 * sources can set the data, resolving the listener's promise.
 *
 * This manager is designed to have a single consumer and multiple producers,
 * therefore, `wait` is called only once.
 *
 * Skyra's actions will always call the `set` method before an action is taken,
 * aborting it with the `unset` method if the action fails. This way,
 * information can be passed to the logging listener without wait.
 *
 * Audit logs will always call the `setFromAuditLogs` method after the action
 * has been taken (when `wait` is called), resolving the promise. As such, it is
 * important for the consumer to call `wait` as soon as possible.
 *
 * Consumers may call `unset` to clear the context data if it won't be used due
 * to the guild's configuration settings. However, it may not call `wait` twice.
 */
export class LoggerTypeManager<Entry extends LoggerTypeContext = LoggerTypeContext> {
	#manager: LoggerManager;
	#context = new Collection<Snowflake, { timeout: NodeJS.Timeout; entry: Entry }>();
	#promises = new Collection<Snowflake, ReferredPromise<Entry | null>>();

	public constructor(manager: LoggerManager) {
		this.#manager = manager;
	}

	/**
	 * Returns whether or not the context data is set, which will always be true
	 * when an action was taken by Skyra.
	 * @param id The ID of the context data to check.
	 */
	public isSet(id: Snowflake) {
		return this.#context.has(id);
	}

	/**
	 * Wait for the context data to be set.
	 * @param id The ID of the context data to wait for.
	 */
	public async wait(id: Snowflake): Promise<Entry | null> {
		// 1. If the context data was set beforehand by Skyra, return it
		// immediately.
		const existing = this.#context.get(id);
		if (existing) {
			clearTimeout(existing.timeout);
			this.#context.delete(id);
			return existing.entry;
		}

		// 2. The action was not taken by Skyra, fallback to audit logs.
		// If the bot cannot view audit logs, return null immediately.
		if (!this.#manager.canViewAuditLogs) return null;

		// 3. Wait for audit logs to set the context data.
		const promise = createReferPromise<Entry | null>();
		const timeout = setTimeout(() => promise.resolve(null), Time.Second * 30);
		this.#promises.set(id, promise);
		try {
			return await promise.promise;
		} finally {
			clearTimeout(timeout);
			this.#promises.delete(id);
		}
	}

	/**
	 * Sets the context data for the given ID, happens before {@linkcode wait}
	 * is called.
	 * @param id The ID of the context data to set.
	 * @param data The context data to set.
	 */
	public set(id: Snowflake, entry: Entry) {
		this.#context.set(id, {
			timeout: setTimeout(() => this.#context.delete(id), Time.Minute * 5).unref(),
			entry
		});
	}

	/**
	 * Unsets the context data for the given ID, useful when the action failed.
	 * @param id The ID of the context data to unset.
	 */
	public unset(id: Snowflake) {
		const entry = this.#context.get(id);
		if (entry) {
			clearTimeout(entry.timeout);
			this.#context.delete(id);
		}
	}

	/**
	 * Sets the context data from the audit logs, will always happen after
	 * {@linkcode wait} is called.
	 * @param id The ID of the context data to set.
	 * @param data The context data to set.
	 */
	public setFromAuditLogs(id: Snowflake, data: Entry) {
		this.#promises.get(id)?.resolve(data);
	}
}

export interface LoggerTypeContext {
	userId: Snowflake;
	reason?: string | null;
}
