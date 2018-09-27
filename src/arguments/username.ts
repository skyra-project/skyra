import { Collection } from 'discord.js';
import { Argument, FuzzySearch, Possible, Snowflake } from '../index';
import { SkyraGuildMember } from '../lib/types/discord.js';
import { Argument as ArgumentType, SkyraGuild, SkyraMessage, SkyraUser } from '../lib/types/klasa';
const USER_REGEXP: RegExp = /^(?:<@!?)?(\d{17,19})>?$/;
const USER_TAG: RegExp = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	public get user(): ArgumentType {
		// @ts-ignore
		return this.store.get('user');
	}

	// @ts-ignore
	public async run(arg: string, possible: Possible, msg: SkyraMessage, filter: (entry: string) => boolean): Promise<SkyraUser> {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
		if (!msg.guild) return this.user.run(arg, possible, msg);
		const resUser: SkyraUser | null = await this.resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const result: [Snowflake, string] | null = await new FuzzySearch<Snowflake, string, Collection<Snowflake, string>>(msg.guild.nameDictionary, (entry) => entry, filter).run(msg, arg);
		// @ts-ignore
		if (result) return this.client.users.fetch(result[0]) as Promise<SkyraUser>;
		throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
	}

	public async resolveUser(query: string, guild: SkyraGuild): Promise<SkyraUser | null> {
		// @ts-ignore
		if (USER_REGEXP.test(query)) return guild.client.users.fetch((<RegExpExecArray> USER_REGEXP.exec(query))[1]).catch(() => null);
		if (USER_TAG.test(query)) {
			const res: SkyraGuildMember | undefined = guild.members.find((member) => member.user.tag === query);
			// @ts-ignore
			return res ? res.user : null;
		}
		return null;
	}

}
