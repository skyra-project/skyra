import { Snowflake } from 'discord.js';
import { util } from 'klasa';
import Skyra from '../Skyra.js';
import { enumerable } from '../types/Decorators.js';
import { SkyraGuildMember } from '../types/discord.js';
const SORT = (x, y) => +(y.count > x.count) || +(x.count === y.count) - 1;

type MemberSettingsJSON = {
	count: number;
	guild: Snowflake;
	member: Snowflake;
};

/**
 * The MemberSettings class that manages per-member settings
 * @since 1.6.0
 * @version 5.0.0
 */
export default class MemberSettings {

	/**
	 * Get the member
	 * @since 3.0.0
	 */
	public get member(): SkyraGuildMember {
		return this.client.guilds.get(this.guildID).members.get(this.userID);
	}

	/**
	 * The client this MemberSettings was created with.
	 * @since 3.0.0
	 */
	@enumerable(false)
	public client: Skyra;

	/**
	 * The amount of points
	 * @since 3.0.0
	 */
	public count: number;

	/**
	 * The promise sync status, if syncing.
	 * @since 3.0.0
	 */
	@enumerable(false)
	private _syncStatus: Promise<this> | null;

	/**
	 * The guild id where the member belongs to.
	 * @since 3.0.0
	 */
	@enumerable(false)
	private guildID: Snowflake;

	/**
	 * The member id.
	 * @since 3.0.0
	 */
	@enumerable(false)
	private userID: Snowflake;

	/**
	 * The UUID for this entry.
	 * @since 3.0.0
	 */
	@enumerable(false)
	private UUID: string;

	/**
	 * Create a new instance of MemberSettings given a GuildMember instance
	 * @since 3.0.0
	 */
	public constructor(member: SkyraGuildMember) {
		this.userID = member.id;
		this.count = 0;
		this.UUID = null;
		this._syncStatus = null;

		// Sync the settings
		this.sync();
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 */
	public async destroy(): Promise<void> {
		if (this.UUID) {
			await this.client.providers.default.db.table('localScores').get(this.UUID).delete();
			this.UUID = null;
		}
		this.count = 0;
	}

	/**
	 * Synchronize the MemberSettings instance with the database
	 * @since 3.0.0
	 */
	public sync(): Promise<this> {
		if (!this.client._skyraReady) return Promise.resolve(this);
		if (!this._syncStatus) {
			this._syncStatus = (async() => {
				const data = this._resolveData(await this.client.providers.default.db.table('localScores').getAll([this.guildID, this.userID], { index: 'guild_user' }).run()
					.catch(() => []));

				if (data) {
					this.UUID = data.id;
					this.count = data.count;
				}

				this._syncStatus = null;

				return this;
			})();
		}
		return this._syncStatus;
	}

	/**
	 * @since 3.0.0
	 */
	public toJSON(): MemberSettingsJSON {
		const guild = this.client.guilds.get(this.guildID);
		const member = guild ? guild.members.get(this.userID) : null;

		return {
			count: this.count,
			guild: guild ? guild.id : null,
			member: member ? member.id : null
		};
	}

	/**
	 * @since 3.0.0
	 */
	public toString(): string {
		return `MemberSettings(${this.guildID}::${this.userID})`;
	}

	/**
	 * Update the member instance
	 * @since 3.0.0
	 * @param amount The amount of points to increase
	 */
	public async update(amount: number): Promise<this> {
		if (this._syncStatus) throw new Error(`[${this}] MemberSettings#update cannot execute due to out-of-sync entry.`);
		if (!util.isNumber(amount)) throw new TypeError(`[${this}] MemberSettings#update expects a number.`);
		if (amount < 0) throw new TypeError(`[${this}] MemberSettings#update expects a positive number.`);
		await (this.UUID
			? this.client.providers.default.db.table('localScores').get(this.UUID).update({ count: amount | 0 }).run()
			: this.client.providers.default.db.table('localScores').insert({ guildID: this.guildID, userID: this.userID, count: amount | 0 }).run()
				.then((result) => { [this.UUID] = result.generated_keys; }));
		this.count = amount | 0;

		return this;
	}

	private _patch(data) {
		if (typeof data.id !== 'undefined') this.UUID = data.id;
		if (typeof data.count === 'number') this.count = data.count;
	}

	private _resolveData(entries) {
		if (!entries.length) return null;
		if (entries.length === 1) return entries[0];
		const sorted = entries.sort(SORT);
		const [highest] = sorted.splice(0, 1);
		const table = this.client.providers.default.db.table('localScores');
		for (const entry of sorted) {
			this.client.emit('verbose', `[CORRUPTION] [localScores - ${entry.guildID}:${entry.userID}] (${entry.id}) ${entry.count} < ${highest.count}.`);
			table.get(entry.id).delete().run();
		}
		return highest;
	}

}

module.exports = MemberSettings;
