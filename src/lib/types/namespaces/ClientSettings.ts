export namespace ClientSettings {

	export type UserBlacklist = Array<string>;
	export type GuildBlacklist = Array<string>;
	export type Schedules = Array<RawScheduledTask>;

	export namespace Boosts {
		export type Guilds = string;
		export type Users = string;
	}

}

export namespace ClientSettings {

	export const UserBlacklist = 'userBlacklist';
	export const GuildBlacklist = 'guildBlacklist';
	export const Schedules = 'schedules';

	export namespace Boosts {
		export const Guilds = 'boosts.guilds';
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
