import { LanguageKeys } from '#lib/i18n/languageKeys';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { RoleMentionRegex, SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { Argument, ArgumentContext } from '@sapphire/framework';
import type { Guild, Role } from 'discord.js';

export class UserArgument extends Argument<Role> {
	public get role() {
		return this.store.get('role') as Argument<Role>;
	}

	public async run(parameter: string, context: ArgumentContext<Role>, filter?: (entry: Role) => boolean) {
		const { message } = context;
		if (!message.guild) return this.role.run(parameter, context);

		const resolvedRole = this.resolveRole(parameter, message.guild);
		if (resolvedRole) return this.ok(resolvedRole);

		const result = await new FuzzySearch(message.guild.roles.cache, (entry) => entry.name, filter).run(message, parameter, context.minimum);
		if (result) return this.ok(result[1]);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Role, context });
	}

	public resolveRole(query: string, guild: Guild) {
		const role = RoleMentionRegex.exec(query) ?? SnowflakeRegex.exec(query);
		return role ? guild.roles.cache.get(role[1]) ?? null : null;
	}
}
