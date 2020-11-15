import { PreciseTimeout } from '@utils/PreciseTimeout';
import { Guild } from 'discord.js';
import { ModerationActions } from './ModerationActions';

export interface LockdownEntry {
	timeout: PreciseTimeout | null;
}

/**
 * @version 3.0.0
 */
export class GuildSecurity {
	/**
	 * The SkyraGuild instance which manages this instance
	 */
	public guild: Guild;

	/**
	 * The moderation actions
	 */
	public actions: ModerationActions;

	/**
	 * The lockdowns map
	 */
	public lockdowns: Map<string, LockdownEntry> = new Map();

	public constructor(guild: Guild) {
		this.guild = guild;
		this.actions = new ModerationActions(this.guild);
	}
}
