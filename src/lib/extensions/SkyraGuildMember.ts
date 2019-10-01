import { Structures } from 'discord.js';
import { Settings } from 'klasa';
import { Databases } from '../types/constants/Constants';

export class SkyraGuildMember extends Structures.get('GuildMember') {

	/**
	 * The member level settings for this context
	 */
	public settings = this.client.gateways.get(Databases.Members)!.acquire(this, `${this.guild!.id}.${this.id}`);

}

declare module 'discord.js' {
	export interface GuildMember {
		settings: Settings;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
