import { Snowflake } from 'discord.js';
import { SkyraGuildMember } from '../../types/discord.js';
import { GuildSettings, SkyraGuild } from '../../types/klasa';

/**
 * The AntiRaid class that manages the raiding protection for guilds
 * @since 2.1.0
 * @version 3.0.0
 */
export default class AntiRaid {

	/**
	 * Get the default role ID, if configured
	 * @since 3.0.0
	 */
	private get guildSettings(): GuildSettings {
		return this.guild.settings;
	}
	/**
	 * Create a new AntiRaid instance
	 * @since 2.1.0
	 */
	public constructor(guild: SkyraGuild) {
		this.guild = guild;
	}

	/**
	 * The Guild instance that manages this instance
	 * @since 2.1.0
	 */
	public guild: SkyraGuild;

	/**
	 * Whether the guild is under attack or not
	 * @since 2.1.0
	 */
	public attack: boolean = false;

	/**
	 * The timeout for the AntiRaid
	 * @since 2.1.0
	 */
	private _timeout: NodeJS.Timer | null = null;

	/**
	 * Check if a member is in the raid list
	 * @since 3.3.0
	 * @param member The member to check
	 */
	public has(member: SkyraGuildMember | Snowflake): boolean {
		const userID: Snowflake = member instanceof SkyraGuildMember ? member.id : member;
		return this.guild.client.timeoutManager.has(`raid-${this.guild.id}-${userID}`);
	}

	/**
	 * Add a member to the cache
	 * @since 2.1.0
	 * @param member The member to add
	 */
	public add(member: SkyraGuildMember | Snowflake): this {
		const userID: Snowflake = member instanceof SkyraGuildMember ? member.id : member;
		this.guild.client.timeoutManager.set(`raid-${this.guild.id}-${userID}`, Date.now() + 20000, () => this.delete(userID));
		return this;
	}

	/**
	 * Delete a member from the cache
	 * @since 2.1.0
	 * @param member The member to delete
	 */
	public delete(member: SkyraGuildMember | Snowflake): this {
		const userID: Snowflake = member instanceof SkyraGuildMember ? member.id : member;
		this.guild.client.timeoutManager.delete(`raid-${this.guild.id}-${userID}`);
		return this;
	}

	/**
	 * Execute the RAID protection
	 * @since 2.1.0
	 */
	public async execute(): Promise<SkyraGuildMember[] | null> {
		if (!this.guild.me.permissions.has('KICK_MEMBERS')) return null;

		// Stop the previous attack mode and reset to
		// clean status
		this.stop();

		// Set the attack mode to true
		this.attack = true;

		// Filter the users, and kick
		const kickedMembers: SkyraGuildMember[] = await this.prune();

		// Create the timeout for stopping the AntiRAID mode
		this.guild.client.timeoutManager.set(`raid-${this.guild.id}`, Date.now() + 20000, () => this.stop(), true);

		// Return the kicked members
		return kickedMembers;
	}

	/**
	 * Stop the attack mode
	 * @since 3.0.0
	 */
	public stop(): void {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		if (this.attack) this.attack = false;
	}

	/**
	 * Override to clear the timeouts for each member
	 * @since 3.0.0
	 */
	public clear(): void {
		// Clear all timeouts
		for (const key of this.keys()) this.guild.client.timeoutManager.delete(key);

		// Clear the attack mode and timeout
		this.stop();
	}

	public *keys(): Iterable<string> {
		const prefix: string = `raid-${this.guild.id}-`;
		for (const key of this.guild.client.timeoutManager.keys())
			if (key.startsWith(prefix)) yield key;
	}

	public *members(): Iterable<Snowflake> {
		const prefix: string = `raid-${this.guild.id}-`;
		const { length } = prefix;
		for (const key of this.guild.client.timeoutManager.keys())
			if (key.startsWith(prefix)) yield key.slice(length);
	}

	/**
	 * Kicks a member
	 * @since 3.0.0
	 * @param member The member to kick
	 */
	public async kick(member: SkyraGuildMember): Promise<SkyraGuildMember> {
		await member.kick(`[ANTI-RAID] Threshold: ${this.guildSettings.selfmod.raidthreshold}`);
		this.delete(member.id);
		return member;
	}

	/**
	 * Filters the members
	 * @since 3.0.0
	 * @param kick Whether the filter should kick the filtered members
	 */
	public async prune(kick: boolean = true): Promise<SkyraGuildMember[]> {
		const initialRole: Snowflake = <Snowflake> this.guildSettings.roles.initial;
		const minRolesAmount: number = initialRole ? 2 : 1;
		const kickedUsers: SkyraGuildMember[] = [];

		for (const memberID of this.members()) {
			const member: SkyraGuildMember | undefined = await this.guild.members.fetch(memberID).catch(noop);
			// Check if:
			// The member exists
			// The member is kickable
			// The member has more roles than the minimum they get at joining
			// If the defaultRole is defined and the member has two roles but doesn't have it
			//   ^ Only possible if the role got removed and added another, i.e. the Muted role
			//     or given by a moderator
			if (member
				&& member.kickable
				&& member.roles.size <= minRolesAmount
				&& (initialRole && member.roles.has(initialRole) ? member.roles.size < minRolesAmount : member.roles.size <= minRolesAmount))
				await this.kick(member)
					.then(() => kickedUsers.push(member))
					.catch(noop);
			else if (kick) {
				this.delete(memberID);
			}
		}

		return kickedUsers;
	}

}

function noop(): undefined { return; }

export default AntiRaid;
