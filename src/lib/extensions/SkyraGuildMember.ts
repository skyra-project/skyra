import { GuildMember, Structures } from 'discord.js';
import { MemberSettings } from '../structures/MemberSettings';

export class SkyraGuildMember extends GuildMember {

	/**
	 * The member level settings for this context
	 */
	public settings = this.client.gateways.get('members').acquire(this) as MemberSettings;
}

declare module 'discord.js' {
	export interface GuildMember {
		settings: MemberSettings;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
