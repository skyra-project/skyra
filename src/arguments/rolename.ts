import { FuzzySearch } from '@utils/FuzzySearch';
import { Role } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';

const ROLE_REGEXP = Argument.regex.role;

export default class extends Argument {
	public get role() {
		return this.store.get('role')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw message.language.get('resolverInvalidRoleName', { name: possible.name });
		if (!message.guild) return this.role.run(arg, possible, message);
		const resRole = this.resolveRole(arg, message.guild);
		if (resRole) return resRole;

		const result = await new FuzzySearch(message.guild.roles.cache, (entry) => entry.name, filter).run(message, arg, possible.min || undefined);
		if (result) return result[1];
		throw message.language.get('resolverInvalidRoleName', { name: possible.name });
	}

	public resolveRole(query: string, guild: KlasaGuild) {
		if (ROLE_REGEXP.test(query)) return guild.roles.cache.get(ROLE_REGEXP.exec(query)![1]);
		return null;
	}
}
