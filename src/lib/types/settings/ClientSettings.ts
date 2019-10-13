/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace ClientSettings {

	export const CommandUses = T<number>('commandUses');
	export const UserBlacklist = T<readonly string[]>('userBlacklist');
	export const GuildBlacklist = T<readonly string[]>('guildBlacklist');
	export const Schedules = T<readonly RawScheduledTask[]>('schedules');

	export namespace Boosts {
		export const Guilds = T<readonly string[]>('boosts.guilds');
		export const Users = T<readonly string[]>('boosts.users');
	}

}

interface RawScheduledTask {
	id: string;
	taskName: string;
	time: number;
	catchUp: boolean;
	data: unknown;
	repeat: string;
}
