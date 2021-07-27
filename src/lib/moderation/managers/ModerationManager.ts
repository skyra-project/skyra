import { GuildSettings, ModerationEntity, readSettings } from '#lib/database';
import { createReferPromise, floatPromise, ReferredPromise } from '#utils/common';
import { cast } from '#utils/util';
import Collection, { CollectionConstructor } from '@discordjs/collection';
import { Store } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish, StrictRequired } from '@sapphire/utilities';
import { DiscordAPIError, Guild, TextChannel } from 'discord.js';
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

	public get client() {
		return this.guild.client;
	}

	private get db() {
		return Store.injectedContext.db;
	}

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	/**
	 * The channel where messages have to be sent.
	 */
	public async fetchChannel() {
		const channelID = await readSettings(this.guild, GuildSettings.Channels.Logs.Moderation);
		if (isNullish(channelID)) return null;
		return (this.guild.channels.cache.get(channelID) ?? null) as TextChannel | null;
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

	public getLatestLogForUser(userID: string) {
		if (this.size === 0) return null;

		const minimumTime = Date.now() - 15 * Time.Second;
		return this.reduce<ModerationEntity | null>(
			(prev, curr) =>
				curr.userID === userID
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
				super.get(id) || this._cache(await this.db.fetchModerationEntry({ where: { guildID: this.guild.id, caseID: id } }), CacheActions.None)
			);
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter((entry) => entry.userID === id)
				: this._cache(await this.db.fetchModerationEntries({ where: { guildID: this.guild.id, userID: id } }), CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(await this.db.fetchModerationEntries({ where: { guildID: this.guild.id, caseID: In(id) } }), CacheActions.None);
		}

		if (super.size !== this._count) {
			this._cache(await this.db.fetchModerationEntries({ where: { guildID: this.guild.id } }), CacheActions.Fetch);
		}
		return this;
	}

	public async getCurrentID() {
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

		return lock.resolve;
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
			super.set(entry.caseID, entry.setup(this));
		}

		if (type === CacheActions.Insert) this._count! += parsedEntries.length;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep((value) => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries) ? new Collection<number, ModerationEntity>(entries.map((entry) => [entry.caseID, entry])) : entries;
	}

	public static get [Symbol.species]() {
		return cast<CollectionConstructor>(Collection);
	}
}

interface MaxQuery {
	max: number | null;
}

export type ModerationManagerUpdateData = Partial<Pick<ModerationEntity, 'duration' | 'extraData' | 'moderatorID' | 'reason' | 'imageURL'>>;
export type ModerationManagerCreateData = Omit<ModerationManagerInsertData, 'guildID'>;
export type ModerationManagerInsertData = StrictRequired<Pick<ModerationEntity, 'moderatorID' | 'userID' | 'type'>> &
	Partial<Pick<ModerationEntity, 'duration' | 'extraData' | 'reason' | 'imageURL' | 'createdAt' | 'caseID'>>;
