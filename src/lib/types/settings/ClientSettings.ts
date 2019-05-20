/* eslint-disable @typescript-eslint/no-namespace */

export namespace ClientSettings {
	export type UserBlacklist = Array<string>;
	export const UserBlacklist = 'userBlacklist';
	export type GuildBlacklist = Array<string>;
	export const GuildBlacklist = 'guildBlacklist';
	export type Schedules = Array<RawScheduledTask>;
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
