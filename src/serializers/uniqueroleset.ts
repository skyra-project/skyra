import { Serializer, SerializerUpdateContext, UniqueRoleSet } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';
import { Guild } from 'discord.js';

export default class UserSerializer extends Serializer {
	public validate(data: UniqueRoleSet, { language, guild }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.name === 'string' &&
			Array.isArray(data.roles) &&
			data.roles.every((role) => typeof role === 'string' && guild!.roles.cache.has(role))
		)
			return data;

		throw language.get(LanguageKeys.Serializers.UniqueRoleSetInvalid);
	}

	public stringify(value: UniqueRoleSet, guild: Guild) {
		return `[${value.name} -> \`${value.roles
			.map((role) => guild.roles.cache.get(role)?.name ?? guild.language.get(LanguageKeys.Misc.UnknownRole))
			.join('` | `')}\`]`;
	}
}
