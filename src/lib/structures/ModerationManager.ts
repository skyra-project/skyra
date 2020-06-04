import Collection, { CollectionConstructor } from '@discordjs/collection';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { RawModerationSettings } from '@lib/types/settings/raw/RawModerationSettings';
import { Time } from '@utils/constants';
import { createReferPromise, floatPromise, ReferredPromise } from '@utils/util';
import { DiscordAPIError, Guild, TextChannel } from 'discord.js';
import { ModerationManagerEntry } from './ModerationManagerEntry';

enum CacheActions {
	None,
	Fetch,
	Insert
}

export class ModerationManager extends Collection<number, ModerationManagerEntry> {

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
	private readonly _locks: ReferredPromise<undefined>[] = [];

	public get client() {
		return this.guild.client;
	}

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	/**
	 * The channel where messages have to be sent.
	 */
	public get channel() {
		const channelID = this.guild.settings.get(GuildSettings.Channels.ModerationLogs);
		return (channelID && this.guild.channels.get(channelID) as TextChannel) || null;
	}

	/**
	 * Fetch 100 messages from the modlogs channel
	 */
	public async fetchChannelMessages(remainingRetries = 5): Promise<void> {
		const { channel } = this;
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

		const minimumTime = Date.now() - (15 * Time.Second);
		return this.reduce<ModerationManagerEntry>((prev, curr) => curr.flattenedUser === userID
			? prev === null
				? curr.createdTimestamp >= minimumTime ? curr : prev
				: curr.createdTimestamp > prev.createdTimestamp ? curr : prev
			: prev, undefined);
	}

	public create(data: ModerationManagerCreateData) {
		return new ModerationManagerEntry(this, { guild_id: this.guild.id, ...data });
	}

	public async fetch(id: number): Promise<ModerationManagerEntry | null>;
	public async fetch(id: string | number[]): Promise<Collection<number, ModerationManagerEntry>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | number | number[] | null): Promise<ModerationManagerEntry | Collection<number, ModerationManagerEntry> | this | null> {
		// Case number
		if (typeof id === 'number') {
			return super.get(id) || this._cache(await this.guild.client.queries.fetchModerationLogByCase(this.guild.id, id), CacheActions.None);
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter(entry => entry.user === id)
				: this._cache(await this.guild.client.queries.fetchModerationLogsByUser(this.guild.id, id), CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(await this.guild.client.queries.fetchModerationLogsByCases(this.guild.id, id), CacheActions.None);
		}

		if (super.size !== this._count) {
			this._cache(await this.guild.client.queries.fetchModerationLogsByGuild(this.guild.id), CacheActions.Fetch);
		}
		return this;
	}

	public async count() {
		if (this._count === null) {
			this._count = await this.client.queries.fetchModerationCurrentCaseID(this.guild.id);
		}
		return this._count!;
	}

	public insert(data: ModerationManagerEntry | RawModerationSettings) {
		return this._cache(data, CacheActions.Insert);
	}

	public createLock() {
		const lock = createReferPromise<undefined>();
		this._locks.push(lock);
		floatPromise(this.guild, lock.promise.finally(() => {
			this._locks.splice(this._locks.indexOf(lock), 1);
		}));

		return lock.resolve;
	}

	public releaseLock() {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this._locks.map(lock => lock.promise));
	}

	private _cache(entry: ModerationManagerEntry | RawModerationSettings | null, type: CacheActions): ModerationManagerEntry;
	private _cache(entries: (ModerationManagerEntry | RawModerationSettings | null)[], type: CacheActions): Collection<number, ModerationManagerEntry>;
	private _cache(
		entries: ModerationManagerEntry | RawModerationSettings | (ModerationManagerEntry | RawModerationSettings | null)[] | null,
		type: CacheActions
	): Collection<number, ModerationManagerEntry> | ModerationManagerEntry | null {
		if (!entries) return null;

		function removeNullAndUndefined<TValue>(value: TValue | null | undefined): value is TValue {
			return value !== null && value !== undefined;
		}

		const parsedEntries = Array.isArray(entries)
			? entries.map(entry => entry instanceof ModerationManagerEntry
				? entry
				: entry === null
					? null
					: new ModerationManagerEntry(this, entry)).filter(removeNullAndUndefined)
			: [entries instanceof ModerationManagerEntry ? entries : new ModerationManagerEntry(this, entries)];

		for (const entry of parsedEntries) {
			super.set(entry.case!, entry);
		}

		if (type === CacheActions.Insert) ++this._count!;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep(value => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries)
			? new Collection<number, ModerationManagerEntry>(parsedEntries.map(entry => [entry.case!, entry]))
			: parsedEntries[0];
	}

	public static get [Symbol.species]() {
		return Collection as unknown as CollectionConstructor;
	}

}

export type ModerationManagerUpdateData = Partial<Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason' | 'image_url'>>;
export type ModerationManagerCreateData = Omit<ModerationManagerInsertData, 'guild_id'>;
export type ModerationManagerInsertData = Pick<RawModerationSettings, 'guild_id' | 'user_id' | 'type'>
& Partial<Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason' | 'image_url' | 'created_at' | 'case_id'>>;
