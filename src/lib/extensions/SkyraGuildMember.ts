import { Structures } from 'discord.js';

export class SkyraGuildMember extends GuildMember {

	/**
	 * The member level settings for this context
	 */
	public settings = new MemberSettings(this);
}

declare module 'discord.js' {
	export interface GuildMember {
		settings: MemberSettings;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
