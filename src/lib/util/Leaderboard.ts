import { Client, Collection } from 'discord.js';
import { PreciseTimeout } from './PreciseTimeout';

const LIMITS = {
	GLOBAL: 25000,
	MEMBERS: 5000
};

/**
 * The Leaderboard singleton class in charge of storing local and global leaderboards
 * @version 2.0.0
 */
export class Leaderboard {
	/**
	 * The Client that initialized this instance
	 */
	public client: Client;

	/**
	 * The cached global leaderboard
	 */
	private readonly users: Collection<string, LeaderboardUser> = new Collection();

	/**
	 * The cached collection for local leaderboards
	 */
	private readonly guilds: Collection<string, Collection<string, LeaderboardUser>> = new Collection();

	/**
	 * The timeouts object
	 */
	private readonly timeouts: LeaderboardTimeouts = {
		guilds: new Collection(),
		users: null
	};

	/**
	 * The temporal promises
	 */
	private readonly _tempPromises: LeaderboardPromises = {
		guilds: new Collection(),
		users: null
	};

	public constructor(client: Client) {
		this.client = client;
	}

	public async fetch(guild?: string): Promise<Collection<string, LeaderboardUser>> {
		if (guild) {
			if (this._tempPromises.guilds.has(guild)) await this._tempPromises.guilds.get(guild);
			else if (!this.guilds.has(guild)) await this._syncMembers(guild);
			return this.guilds.get(guild);
		}

		if (this._tempPromises.users) await this._tempPromises.users;
		else if (this.users.size === 0) await this._syncUsers();
		return this.users;
	}

	/**
	 * Clear the entire cache and timeouts
	 */
	public dispose(): void {
		this.clearGuilds();
		this.clearUsers();
	}

	/**
	 * Clear the guilds cache
	 */
	public clearGuilds(): void {
		for (const timeout of this.timeouts.guilds.values())
			timeout.stop();
	}

	/**
	 * Clear the user leaderboard cache
	 */
	public clearUsers(): void {
		if (this.timeouts.users)
			this.timeouts.users.stop();
	}

	/**
	 * Sync the leaderboard for the selected guild
	 * @param guild A guild id
	 */
	private async _syncMembers(guild: string): Promise<void> {
		// If it's still on timeout, reset it
		if (this.timeouts.guilds.has(guild))
			this.timeouts.guilds.get(guild).stop();
		// It's not deleting the entry as the previous run will resolve

		// Get the sorted data from the db
		const promise: Promise<void> = new Promise(async(resolve) => {
			const r = this.client.providers.default.db;
			// orderBy with index on getAll doesn't work: https://github.com/rethinkdb/rethinkdb/issues/2670
			const data = await r.table('localScores').getAll(guild, { index: 'guildID' }).orderBy(r.desc('count')).limit(LIMITS.MEMBERS).run();

			// Clear the leaderboards for said guild
			if (!this.guilds.has(guild)) this.guilds.set(guild, new Collection());
			else this.guilds.get(guild).clear();

			// Get the store and initialize the position number, then save all entries
			const store = this.guilds.get(guild);
			let i = 0;
			for (const entry of data) {
				const old = store.get(entry.userID);
				if (old && old.points > entry.count) {
					this.client.emit('verbose', `[CORRUPTION] [localScores - ${entry.guildID}:${entry.userID}] (${entry.id}) ${entry.count} < ${old.points}.`);
					await r.table('localScores').get(entry.id).delete().run();
				} else {
					store.set(entry.userID, { name: null, points: entry.count, position: ++i });
				}
			}

			this._tempPromises.guilds.delete(guild);
			resolve();
		});

		this._tempPromises.guilds.set(guild, promise);
		await promise;

		// Set the timeout for the refresh
		const timeout = new PreciseTimeout(MINUTE * 10);
		this.timeouts.guilds.set(guild, timeout);

		// tslint:disable-next-line:no-floating-promises
		timeout.run().then(() => {
			this.timeouts.guilds.delete(guild);
			this.guilds.get(guild).clear();
			this.guilds.delete(guild);
		});
	}

	/**
	 * Sync the global leaderboard
	 */
	private async _syncUsers(): Promise<void> {
		await (this._tempPromises.users = new Promise(async(resolve) => {
			// Get the sorted data from the db
			const r = this.client.providers.default.db;
			const data = await r.table('users').orderBy({ index: r.desc('points') }).limit(LIMITS.GLOBAL).run();

			// Get the store and initialize the position number, then save all entries
			this.users.clear();
			let i = 0;
			for (const entry of data)
				this.users.set(entry.id, { name: null, points: entry.points, position: ++i });

			this._tempPromises.users = null;
			resolve();
		}));

		// If it's still on timeout, reset it
		this.clearUsers();

		// Set the timeout for the refresh
		this.timeouts.users = new PreciseTimeout(MINUTE * 15);
		// tslint:disable-next-line:no-floating-promises
		this.timeouts.users.run().then(() => {
			this.timeouts.users = null;
			this.users.clear();
		});
	}

}

export interface LeaderboardUser {
	points: number;
	position: number;
	name: string | null;
}

interface LeaderboardTimeouts {
	users: PreciseTimeout | null;
	guilds: Collection<string, PreciseTimeout>;
}

interface LeaderboardPromises {
	/**
	 * The Promise that is syncing the user leaderboard cache with the database, if syncing
	 */
	users: Promise<void> | null;
	/**
	 * The collection of Promises that are running for each guild leaderboard, if syncing
	 */
	guilds: Collection<string, Promise<void>>;
}

const SECOND = 1000;
const MINUTE = SECOND * 60;
