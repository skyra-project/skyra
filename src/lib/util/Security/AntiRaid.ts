import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { noop } from '@sapphire/utilities';
import { cast } from '@utils/util';
import { Collection, Guild, GuildMember } from 'discord.js';

/**
 * The AntiRaid class that manages the raiding protection for guilds
 * @version 4.0.0
 */
export class AntiRaid extends Collection<string, AntiRaidEntry> {
	/**
	 * The Guild instance that manages this instance
	 */
	public guild: Guild;

	/**
	 * Whether the guild is under attack or not
	 */
	public attack = false;

	/**
	 * The sweep interval for this AntiRaid
	 */
	private _sweepInterval: NodeJS.Timeout | null = null;

	/**
	 * The timeout to disable attack mode
	 */
	private _timeout: NodeJS.Timeout | null = null;

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public get limit() {
		return this.guild.settings.get(GuildSettings.Selfmod.Raidthreshold);
	}

	public add(id: string) {
		this.sweep();
		this.create(id);
	}

	public acquire(id: string) {
		return this.get(id) || this.create(id);
	}

	public create(id: string) {
		const rateLimit = { id, time: Date.now() + 20000 };
		this.set(id, rateLimit);
		if (!this._sweepInterval) this._sweepInterval = cast<NodeJS.Timeout>(setInterval(this.sweep.bind(this), 30000));
		return rateLimit;
	}

	public sweep(fn?: (value: AntiRaidEntry, key: string, collection: this) => boolean, thisArg?: unknown) {
		if (!fn) {
			const now = Date.now();
			fn = (value) => now > value.time;
		}
		const amount = super.sweep(fn, thisArg);

		if (this.size === 0) {
			clearInterval(this._sweepInterval!);
			this._sweepInterval = null;
		}

		return amount;
	}

	/**
	 * Stop the attack mode
	 */
	public stop() {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		if (this.attack) this.attack = false;
	}

	/**
	 * Kicks a member
	 * @param member The member to kick
	 */
	public async kick(member: GuildMember) {
		await member.kick(`[ANTI-RAID] Threshold: ${this.limit}`);
		this.delete(member.id);
		return member;
	}

	public [Symbol.asyncIterator]() {
		this.sweep();
		const entriesIterator = this.entries();
		const initialRole = this.guild.settings.get(GuildSettings.Roles.Initial);
		const minRolesAmount = initialRole ? 2 : 1;
		const iterator: AsyncIterator<GuildMember | null> = {
			next: async () => {
				const next = entriesIterator.next();
				if (next.done) return { done: true, value: null };
				const [id, value] = next.value;
				const member = await this.guild.members.fetch(value.id).catch(noop);

				// Check if:
				// The member exists
				// The member is kickable
				// The member has more roles than the minimum they get at joining
				// If the defaultRole is defined and the member has two roles but doesn't have it
				//   ^ Only possible if the role got removed and added another, i.e. the Muted role
				//     or given by a moderator
				if (
					member && member.kickable && member.roles.cache.size <= minRolesAmount && initialRole ? member.roles.cache.has(initialRole) : true
				) {
					return { done: false, value: member as GuildMember };
				}

				this.delete(id);
				return { done: false, value: null };
			}
		};

		return iterator;
	}
}

interface AntiRaidEntry {
	id: string;
	time: number;
}
