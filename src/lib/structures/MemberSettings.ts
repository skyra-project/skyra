import { GuildMember } from 'discord.js';
import { Gateway, Settings } from 'klasa';

/**
 * The MemberSettings class that manages per-member settings
 * @version 6.0.0
 */
export class MemberSettings extends Settings {

	public target: GuildMember;

	public constructor(gateway: Gateway, target: GuildMember) {
		super(gateway, target, `${target.guild.id}.${target.id}`);
	}

}
