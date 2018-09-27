import { Role, RoleStore } from 'discord.js';
import { Argument, FuzzySearch, Possible, Snowflake } from '../index';
import { Argument as ArgumentType, SkyraGuild, SkyraMessage } from '../lib/types/klasa';
const ROLE_REGEXP: RegExp = /^(?:<@&)?(\d{17,19})>?$/;

export default class extends Argument {

	public get role(): ArgumentType {
		// @ts-ignore
		return this.store.get('role');
	}

	// @ts-ignore
	public async run(arg: string, possible: Possible, msg: SkyraMessage, filter: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
		if (!msg.guild) return this.role.run(arg, possible, msg);
		const resRole: Role | null = this.resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const result: [Snowflake, Role] | null = await new FuzzySearch<Snowflake, Role, RoleStore>(msg.guild.roles, (entry: Role) => entry.name, filter).run(msg, arg);
		if (result) return result[1];
		throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
	}

	public resolveRole(query: string, guild: SkyraGuild): Role | null {
		return (ROLE_REGEXP.test(query) && guild.roles.get((<RegExpExecArray> ROLE_REGEXP.exec(query))[1])) || null;
	}

}
