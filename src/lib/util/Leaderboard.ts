import { Client, Collection } from 'discord.js';
import { PreciseTimeout } from './PreciseTimeout';
import { Time } from './constants';

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
	private readonly kUsers: Collection<string, LeaderboardUser> = new Collection();

	/**
	 * The cached collection for local leaderboards
	 */
	private readonly kGuilds: Collection<string, Collection<string, LeaderboardUser>> = new Collection();

	/**
	 * The timeouts object
	 */
	private readonly kTimeouts: LeaderboardTimeouts = {
		guilds: new Collection(),
		users: null
	};

	/**
	 * The temporal promises
	 */
	private readonly kTempPromises: LeaderboardPromises = {
		guilds: new Collection(),
		users: null
	};

	public constructor(client: Client) {
		this.client = client;
	}

	public async fetch(guild?: string) {
		if (guild) {
			if (this.kTempPromises.guilds.has(guild)) await this.kTempPromises.guilds.get(guild);
			else if (!this.kGuilds.has(guild)) await this.syncMembers(guild);
			return this.kGuilds.get(guild)!;
		}

		if (this.kTempPromises.users) await this.kTempPromises.users;
		else if (this.kUsers.size === 0) await this.syncUsers();
		return this.kUsers;
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
		for (const timeout of this.kTimeouts.guilds.values()) {
			timeout.stop();
		}
	}

	/**
	 * Clear the user leaderboard cache
	 */
	public clearUsers(): void {
		if (this.kTimeouts.users) {
			this.kTimeouts.users.stop();
		}
	}

	/**
	 * Sync the leaderboard for the selected guild
	 * @param guild A guild id
	 */
	private async syncMembers(guild: string): Promise<void> {
		// If it's still on timeout, reset it
		if (this.kTimeouts.guilds.has(guild)) {
			this.kTimeouts.guilds.get(guild)!.stop();
		}
		// It's not deleting the entry as the previous run will resolve

		// Get the sorted data from the db
		const promise = new Promise<void>(resolve => this.createMemberSyncHandle(guild).then(resolve));

		this.kTempPromises.guilds.set(guild, promise);
		await promise;

		// Set the timeout for the refresh
		const timeout = new PreciseTimeout(Time.Minute * 10);
		this.kTimeouts.guilds.set(guild, timeout);

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		timeout.run().then(() => {
			this.kTimeouts.guilds.delete(guild);
			this.kGuilds.get(guild)!.clear();
			this.kGuilds.delete(guild);
		});
	}

	private async createMemberSyncHandle(guild: string) {
		const data = await this.client.queries.fetchLeaderboardLocal(guild);

		// Clear the leaderboards for said guild
		if (this.kGuilds.has(guild)) this.kGuilds.get(guild)!.clear();
		else this.kGuilds.set(guild, new Collection());

		// Get the store and initialize the position number, then save all entries
		const store = this.kGuilds.get(guild)!;
		let i = 0;
		for (const entry of data) {
			store.set(entry.user_id, { name: null, points: entry.point_count, position: ++i });
		}

		this.kTempPromises.guilds.delete(guild);
	}

	/**
	 * Sync the global leaderboard
	 */
	private async syncUsers(): Promise<void> {
		const promise = new Promise<void>(resolve => this.createUserSyncHandle().then(resolve));
		await (this.kTempPromises.users = promise);

		// If it's still on timeout, reset it
		this.clearUsers();

		// Set the timeout for the refresh
		this.kTimeouts.users = new PreciseTimeout(Time.Minute * 15);

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		this.kTimeouts.users.run().then(() => {
			this.kTimeouts.users = null;
			this.kUsers.clear();
		});
	}

	private async createUserSyncHandle() {
		// Get the sorted data from the db
		const data = await this.client.queries.fetchLeaderboardGlobal();

		// Get the store and initialize the position number, then save all entries
		this.kUsers.clear();
		let i = 0;
		for (const entry of data) {
			this.kUsers.set(entry.user_id, { name: null, points: entry.point_count, position: ++i });
		}

		this.kTempPromises.users = null;
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
