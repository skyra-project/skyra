import { readSettings } from '#lib/database/settings';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationManagerEntry } from '#lib/moderation/managers/ModerationManagerEntry';
import { SortedCollection } from '#lib/structures/data';
import { Events } from '#lib/types';
import { createReferPromise, desc, floatPromise, minutes, orMix, seconds, type BooleanFn, type ReferredPromise } from '#utils/common';
import { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { AsyncQueue } from '@sapphire/async-queue';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { UserError, container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Guild, Snowflake } from 'discord.js';

enum CacheActions {
	None,
	Fetch,
	Insert
}

export class ModerationManager {
	/**
	 * The Guild instance that manages this manager
	 */
	public readonly guild: Guild;

	/**
	 * The cache of the moderation entries, sorted by their case ID in
	 * descending order.
	 */
	readonly #cache = new SortedCollection<number, ModerationManagerEntry>(undefined, desc);

	/**
	 * A queue for save tasks, prevents case_id duplication
	 */
	readonly #saveQueue = new AsyncQueue();

	/**
	 * The latest moderation case ID.
	 */
	#latest: number | null = null;

	/**
	 * The amount of moderation cases in the database.
	 */
	#count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	#timer: NodeJS.Timeout | null = null;

	/**
	 * The promise to wait for tasks to complete
	 */
	readonly #locks: ReferredPromise<void>[] = [];

	private get db() {
		return container.prisma;
	}

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	/**
	 * The channel where messages have to be sent.
	 */
	public async fetchChannel() {
		const settings = await readSettings(this.guild);
		const channelId = settings.channelsLogsModeration;
		if (isNullish(channelId)) return null;
		return (this.guild.channels.cache.get(channelId) ?? null) as GuildTextBasedChannelTypes | null;
	}

	/**
	 * Retrieves the latest recent cached entry for a given user created in the last 30 seconds.
	 *
	 * @param userId - The ID of the user.
	 * @returns The latest recent cached entry for the user, or `null` if no entry is found.
	 */
	public getLatestRecentCachedEntryForUser(userId: string) {
		const minimumTime = Date.now() - seconds(30);
		for (const entry of this.#cache.values()) {
			if (entry.userId !== userId) continue;
			if (entry.createdAt < minimumTime) break;
			return entry;
		}

		return null;
	}

	public create<Type extends TypeVariation = TypeVariation>(data: ModerationManager.CreateData<Type>): ModerationManager.Entry<Type> {
		return new ModerationManagerEntry({
			id: -1,
			createdAt: -1,
			...data,
			duration: data.duration ?? null,
			extraData: data.extraData ?? (null as ModerationManager.ExtraData<Type>),
			guild: this.guild,
			moderator: data.moderator ?? process.env.CLIENT_ID,
			reason: data.reason ?? null,
			imageURL: data.imageURL ?? null,
			metadata: data.metadata ?? TypeMetadata.None
		});
	}

	public async insert(data: ModerationManager.Entry): Promise<ModerationManager.Entry> {
		await this.#saveQueue.wait();

		try {
			const id = (await this.getCurrentId()) + 1;
			const entry = new ModerationManagerEntry({ ...data.toData(), id, createdAt: Date.now() });
			await this.#performInsert(entry);
			return this.#addToCache(entry, CacheActions.Insert);
		} finally {
			this.#saveQueue.shift();
		}
	}

	/**
	 * Edits a moderation entry.
	 *
	 * @param entryOrId - The entry or ID of the moderation entry to edit.
	 * @param data - The updated data for the moderation entry.
	 * @returns The updated moderation entry.
	 */
	public async edit(entryOrId: ModerationManager.EntryResolvable, data: ModerationManager.UpdateData) {
		const entry = await this.#resolveEntry(entryOrId);
		return this.#performUpdate(entry, data);
	}

	/**
	 * Edits the {@linkcode ModerationManagerEntry.metadata} field from a moderation entry to set
	 * {@linkcode TypeMetadata.Archived}.
	 *
	 * @param entryOrId - The moderation entry or its ID.
	 * @returns The updated moderation entry.
	 */
	public async archive(entryOrId: ModerationManager.EntryResolvable) {
		const entry = await this.#resolveEntry(entryOrId);
		if (entry.isArchived()) return entry;
		return this.#performUpdate(entry, { metadata: entry.metadata | TypeMetadata.Archived });
	}

	/**
	 * Edits the {@linkcode ModerationManagerEntry.metadata} field from a moderation entry to set
	 * {@linkcode TypeMetadata.Completed}.
	 *
	 * @param entryOrId - The moderation entry or its ID.
	 * @returns The updated moderation entry.
	 */
	public async complete(entryOrId: ModerationManager.EntryResolvable) {
		const entry = await this.#resolveEntry(entryOrId);
		if (entry.isCompleted()) return entry;
		return this.#performUpdate(entry, { metadata: entry.metadata | TypeMetadata.Completed });
	}

	/**
	 * Deletes a moderation entry.
	 *
	 * @param entryOrId - The moderation entry or its ID to delete.
	 * @returns The deleted moderation entry.
	 */
	public async delete(entryOrId: ModerationManager.EntryResolvable) {
		const entry = await this.#resolveEntry(entryOrId);

		// Delete the task if it exists
		const { task } = entry;
		if (task) await task.delete();

		// Delete the entry from the DB and the cache
		await this.db.moderation.delete({ where: { caseId_guildId: { caseId: entry.id, guildId: entry.guild.id } } });
		this.#cache.delete(entry.id);

		return entry;
	}

	/**
	 * Fetches a moderation entry from the cache or the database.
	 *
	 * @remarks
	 *
	 * If the entry is not found, it returns null.
	 *
	 * @param id - The ID of the moderation entry to fetch.
	 * @returns The fetched moderation entry, or `null` if it was not found.
	 */
	public async fetch(id: number): Promise<ModerationManager.Entry | null>;
	/**
	 * Fetches multiple moderation entries from the cache or the database.
	 *
	 * @param options - The options to fetch the moderation entries.
	 * @returns The fetched moderation entries, sorted by
	 * {@link ModerationManagerEntry.id} in descending order.
	 */
	public async fetch(options?: ModerationManager.FetchOptions): Promise<SortedCollection<number, ModerationManager.Entry>>;
	public async fetch(
		options: number | ModerationManager.FetchOptions = {}
	): Promise<ModerationManager.Entry | SortedCollection<number, ModerationManager.Entry> | null> {
		// Case number
		if (typeof options === 'number') {
			return this.#getSingle(options) ?? this.#addToCache(await this.#fetchSingle(options), CacheActions.None);
		}

		if (options.moderatorId || options.userId) {
			return this.#count === this.#cache.size //
				? this.#getMany(options)
				: this.#addToCache(await this.#fetchMany(options), CacheActions.None);
		}

		if (this.#count !== this.#cache.size) {
			this.#addToCache(await this.#fetchAll(), CacheActions.Fetch);
		}

		return this.#cache;
	}

	public async getCurrentId(): Promise<number> {
		if (this.#latest === null) {
			const result = await this.db.moderation.getGuildModerationMetadata(this.guild.id);

			this.#count = result.count;
			this.#latest = result.latest;
		}

		return this.#latest;
	}

	public createLock() {
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const lock = createReferPromise<void>();
		this.#locks.push(lock);
		floatPromise(
			lock.promise.finally(() => {
				this.#locks.splice(this.#locks.indexOf(lock), 1);
			})
		);

		return () => lock.resolve();
	}

	public releaseLock() {
		for (const lock of this.#locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this.#locks.map((lock) => lock.promise));
	}

	/**
	 * Checks if a moderation entry has been created for a given type and user
	 * within the last minute.
	 *
	 * @remarks
	 *
	 * This is useful to prevent duplicate moderation entries from being created
	 * when a user is banned, unbanned, or softbanned multiple times in a short.
	 *
	 * @param type - The type of moderation action.
	 * @param userId - The ID of the user.
	 * @returns A boolean indicating whether a moderation entry has been created.
	 */
	public checkSimilarEntryHasBeenCreated(type: TypeVariation, userId: Snowflake) {
		const minimumTime = Date.now() - minutes(1);
		const checkSoftBan = type === TypeVariation.Ban;
		for (const entry of this.#cache.values()) {
			// If it's not the same user target or if it's at least 1 minute old, skip:
			if (userId !== entry.userId || entry.createdAt < minimumTime) continue;

			// If there was a log with the same type in the last minute, return true:
			if (type === entry.type) return true;

			// If this log is a ban or an unban, but the user was softbanned recently, return true:
			if (checkSoftBan && entry.type === TypeVariation.Softban) return true;
		}

		// No similar entry has been created in the last minute:
		return false;
	}

	#addToCache(entry: ModerationManagerEntry | null, type: CacheActions): ModerationManagerEntry;
	#addToCache(entries: ModerationManagerEntry[], type: CacheActions): SortedCollection<number, ModerationManagerEntry>;
	#addToCache(
		entries: ModerationManagerEntry | ModerationManagerEntry[] | null,
		type: CacheActions
	): SortedCollection<number, ModerationManagerEntry> | ModerationManagerEntry | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries) ? entries : [entries];

		for (const entry of parsedEntries) {
			this.#cache.set(entry.id, entry);
		}

		if (type === CacheActions.Insert) {
			this.#count! += parsedEntries.length;
			this.#latest! += parsedEntries.length;
		}

		if (!this.#timer) {
			this.#timer = setInterval(() => {
				this.#cache.sweep((value) => value.cacheExpired);
				if (!this.#cache.size) this.#timer = null;
			}, seconds(30));
		}

		return Array.isArray(entries)
			? new SortedCollection(
					entries.map((entry) => [entry.id, entry]),
					desc
				)
			: entries;
	}

	async #resolveEntry(entryOrId: ModerationManager.EntryResolvable) {
		if (typeof entryOrId === 'number') {
			const entry = await this.fetch(entryOrId);
			if (isNullish(entry)) {
				throw new UserError({ identifier: LanguageKeys.Arguments.CaseUnknownEntry, context: { parameter: entryOrId } });
			}

			return entry;
		}

		if (entryOrId.guild.id !== this.guild.id) {
			throw new UserError({ identifier: LanguageKeys.Arguments.CaseNotInThisGuild, context: { parameter: entryOrId.id } });
		}

		return entryOrId;
	}

	#getSingle(id: number): ModerationManagerEntry | null {
		return this.#cache.get(id) ?? null;
	}

	async #fetchSingle(id: number): Promise<ModerationManagerEntry | null> {
		const entity = await this.db.moderation.findUnique({ where: { caseId_guildId: { guildId: this.guild.id, caseId: id } } });
		return entity && ModerationManagerEntry.from(this.guild, entity);
	}

	#getMany(options: ModerationManager.FetchOptions): SortedCollection<number, ModerationManagerEntry> {
		const fns: BooleanFn<[ModerationManagerEntry]>[] = [];
		if (options.userId) fns.push((entry) => entry.userId === options.userId);
		if (options.moderatorId) fns.push((entry) => entry.moderatorId === options.moderatorId);

		const fn = orMix(...fns);
		return this.#cache.filter((entry) => fn(entry));
	}

	async #fetchMany(options: ModerationManager.FetchOptions): Promise<ModerationManagerEntry[]> {
		const entities = await this.db.moderation.findMany({
			where: {
				guildId: this.guild.id,
				moderatorId: options.moderatorId,
				userId: options.userId
			}
		});
		return entities.map((entity) => ModerationManagerEntry.from(this.guild, entity));
	}

	async #fetchAll(): Promise<ModerationManagerEntry[]> {
		const entities = await this.db.moderation.findMany({ where: { guildId: this.guild.id } });
		return entities.map((entity) => ModerationManagerEntry.from(this.guild, entity));
	}

	async #performInsert(entry: ModerationManager.Entry) {
		await this.db.moderation.create({
			data: {
				caseId: entry.id,
				createdAt: new Date(entry.createdAt),
				duration: entry.duration,
				extraData: entry.extraData,
				guildId: entry.guild.id,
				moderatorId: entry.moderatorId,
				userId: entry.userId,
				reason: entry.reason,
				imageURL: entry.imageURL,
				type: entry.type,
				metadata: entry.metadata
			}
		});

		container.client.emit(Events.ModerationEntryAdd, entry);
		return entry;
	}

	async #performUpdate(entry: ModerationManager.Entry, data: ModerationManager.UpdateData) {
		const result = await this.db.moderation.updateMany({ where: { caseId: entry.id, guildId: entry.guild.id }, data });
		if (result.count === 0) return entry;

		const clone = entry.clone();
		entry.patch(data);
		container.client.emit(Events.ModerationEntryEdit, clone, entry);
		return entry;
	}
}

export namespace ModerationManager {
	export interface FetchOptions {
		userId?: Snowflake;
		moderatorId?: Snowflake;
	}

	export type Entry<Type extends TypeVariation = TypeVariation> = Readonly<ModerationManagerEntry<Type>>;
	export type EntryResolvable<Type extends TypeVariation = TypeVariation> = Entry<Type> | number;

	export type CreateData<Type extends TypeVariation = TypeVariation> = ModerationManagerEntry.CreateData<Type>;
	export type UpdateData<Type extends TypeVariation = TypeVariation> = ModerationManagerEntry.UpdateData<Type>;

	export type ExtraData<Type extends TypeVariation = TypeVariation> = ModerationManagerEntry.ExtraData<Type>;
}
