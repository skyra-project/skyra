import { LanguageKeys } from '#lib/i18n/languageKeys';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import type { Guild, Message, Role } from 'discord.js';
import { Argument, Possible } from 'klasa';

const ROLE_REGEXP = Argument.regex.role;

export default class extends Argument {
	public get role() {
		return this.store.get('role') as Argument;
	}

	public async run(arg: string, possible: Possible, message: Message, filter?: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidRoleName, { name: possible.name });
		if (!message.guild) return this.role.run(arg, possible, message);
		const resRole = this.resolveRole(arg, message.guild);
		if (resRole) return resRole;

		const result = await new FuzzySearch(message.guild.roles.cache, (entry) => entry.name, filter).run(message, arg, possible.min || undefined);
		if (result) return result[1];
		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidRoleName, { name: possible.name });
	}

	public resolveRole(query: string, guild: Guild) {
		if (ROLE_REGEXP.test(query)) return guild.roles.cache.get(ROLE_REGEXP.exec(query)![1]);
		return null;
	}
}
