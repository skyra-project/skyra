import { ModerationEntity } from '#lib/database/entities';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { createReferPromise, floatPromise, seconds, type ReferredPromise } from '#utils/common';
import { AsyncQueue } from '@sapphire/async-queue';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { isNullish, type StrictRequired } from '@sapphire/utilities';
import { Collection, DiscordAPIError, type Guild } from 'discord.js';
import { In } from 'typeorm';

enum CacheActions {
	None,
	Fetch,
	Insert
}

export class ModerationManager extends Collection<number, ModerationEntity> {
	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	/**
	 * A queue for save tasks, prevents case_id duplication
	 */
	private saveQueue = new AsyncQueue();

	/**
	 * The current case count
	 */
	private _count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout | null = null;

	/**
	 * The promise to wait for tasks to complete
	 */
	private readonly _locks: ReferredPromise<void>[] = [];

	private get db() {
		return container.db;
	}

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	/**
	 * The channel where messages have to be sent.
	 */
	public async fetchChannel() {
		const channelId = await readSettings(this.guild, GuildSettings.Channels.Logs.Moderation);
		if (isNullish(channelId)) return null;
		return (this.guild.channels.cache.get(channelId) ?? null) as GuildTextBasedChannelTypes | null;
	}

	/**
	 * Fetch 100 messages from the modlogs channel
	 */
	public async fetchChannelMessages(remainingRetries = 5): Promise<void> {
		const channel = await this.fetchChannel();
		if (channel === null) return;
		try {
			await channel.messages.fetch({ limit: 100 });
		} catch (error) {
			if (error instanceof DiscordAPIError) throw error;
			return this.fetchChannelMessages(--remainingRetries);
		}
	}

	public getLatestLogForUser(userId: string) {
		if (this.size === 0) return null;

		const minimumTime = Date.now() - seconds(15);
		return this.reduce<ModerationEntity | null>(
			(prev, curr) =>
				curr.userId === userId
					? prev === null
						? curr.createdTimestamp >= minimumTime
							? curr
							: prev
						: curr.createdTimestamp > prev.createdTimestamp
							? curr
							: prev
					: prev,
			null
		);
	}

	public create(data: ModerationManagerCreateData) {
		return new ModerationEntity(data).setup(this);
	}

	public async fetch(id: number): Promise<ModerationEntity | null>;
	public async fetch(id: string | number[]): Promise<Collection<number, ModerationEntity>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | number | number[] | null): Promise<ModerationEntity | Collection<number, ModerationEntity> | this | null> {
		// Case number
		if (typeof id === 'number') {
			return (
				super.get(id) || this._cache(await this.db.fetchModerationEntry({ where: { guildId: this.guild.id, caseId: id } }), CacheActions.None)
			);
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter((entry) => entry.userId === id)
				: this._cache(await this.db.fetchModerationEntries({ where: { guildId: this.guild.id, userId: id } }), CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(await this.db.fetchModerationEntries({ where: { guildId: this.guild.id, caseId: In(id) } }), CacheActions.None);
		}

		if (super.size !== this._count) {
			this._cache(await this.db.fetchModerationEntries({ where: { guildId: this.guild.id } }), CacheActions.Fetch);
		}
		return this;
	}

	public async getCurrentId() {
		if (this._count === null) {
			const { moderations } = this.db;

			const [{ max }] = (await moderations.query(
				/* sql */ `
					SELECT max(case_id)
					FROM "${moderations.metadata.tableName}"
					WHERE guild_id = $1;
			`,
				[this.guild.id]
			)) as [MaxQuery];

			this._count = max ?? 0;
		}

		return this._count;
	}

	public async save(data: ModerationEntity) {
		await this.saveQueue.wait();
		try {
			data.caseId = (await this.getCurrentId()) + 1;
			await data.save();
			this.insert(data);
		} finally {
			this.saveQueue.shift();
		}
	}

	public insert(data: ModerationEntity): ModerationEntity;
	public insert(data: ModerationEntity[]): Collection<number, ModerationEntity>;
	public insert(data: ModerationEntity | ModerationEntity[]) {
		// @ts-expect-error TypeScript does not read the overloaded `data` parameter correctly
		return this._cache(data, CacheActions.Insert);
	}

	public createLock() {
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const lock = createReferPromise<void>();
		this._locks.push(lock);
		floatPromise(
			lock.promise.finally(() => {
				this._locks.splice(this._locks.indexOf(lock), 1);
			})
		);

		return () => lock.resolve();
	}

	public releaseLock() {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this._locks.map((lock) => lock.promise));
	}

	private _cache(entry: ModerationEntity | null, type: CacheActions): ModerationEntity;
	private _cache(entries: ModerationEntity[], type: CacheActions): Collection<number, ModerationEntity>;
	private _cache(
		entries: ModerationEntity | ModerationEntity[] | null,
		type: CacheActions
	): Collection<number, ModerationEntity> | ModerationEntity | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries) ? entries : [entries];

		for (const entry of parsedEntries) {
			super.set(entry.caseId, entry.setup(this));
		}

		if (type === CacheActions.Insert) this._count! += parsedEntries.length;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep((value) => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries) ? new Collection<number, ModerationEntity>(entries.map((entry) => [entry.caseId, entry])) : entries;
	}

	public static get [Symbol.species]() {
		return Collection;
	}
}

interface MaxQuery {
	max: number | null;
}

export type ModerationManagerUpdateData = Partial<Pick<ModerationEntity, 'duration' | 'extraData' | 'moderatorId' | 'reason' | 'imageURL'>>;
export type ModerationManagerCreateData = Omit<ModerationManagerInsertData, 'guildId'>;
export type ModerationManagerInsertData = StrictRequired<Pick<ModerationEntity, 'moderatorId' | 'userId' | 'type'>> &
	Partial<Pick<ModerationEntity, 'duration' | 'extraData' | 'reason' | 'imageURL' | 'createdAt' | 'caseId'>>;
