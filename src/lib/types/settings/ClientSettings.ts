/* eslint-disable @typescript-eslint/no-namespace */

export namespace ClientSettings {

	export type CommandUses = number;
	export const CommandUses = 'commandUses';
	export type UserBlacklist = readonly string[];
	export const UserBlacklist = 'userBlacklist';
	export type GuildBlacklist = readonly string[];
	export const GuildBlacklist = 'guildBlacklist';
	export type Schedules = readonly RawScheduledTask[];
	export const Schedules = 'schedules';

	export namespace Boosts {
		export type Guilds = string;
		export const Guilds = 'boosts.guilds';
		export type Users = string;
		export const Users = 'boosts.users';
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
