import { LockdownManager } from '#lib/structures';
import type { Guild } from 'discord.js';

/**
 * @version 3.0.0
 */
export class GuildSecurity {
	/**
	 * The {@link Guild} instance which manages this instance
	 */
	public guild: Guild;

	/**
	 * The lockdowns map
	 */
	public lockdowns = new LockdownManager();

	public constructor(guild: Guild) {
		this.guild = guild;
	}
}
