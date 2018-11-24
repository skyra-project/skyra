import { GuildMember, Structures } from 'discord.js';
import { Settings } from 'klasa';

export class SkyraGuildMember extends GuildMember {

	/**
	 * The member level settings for this context
	 */
	public settings = this.client.gateways.get('members').acquire(this, `${this.guild.id}.${this.id}`);
}

declare module 'discord.js' {
	export interface GuildMember {
		settings: Settings;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
