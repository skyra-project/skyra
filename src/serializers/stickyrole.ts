import { Serializer, SerializerUpdateContext, StickyRole } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';
import { Guild } from 'discord.js';

export default class extends Serializer {
	public validate(data: StickyRole, { language, entity: { guild } }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.user === 'string' &&
			Array.isArray(data.roles) &&
			data.roles.every((role) => typeof role === 'string' && guild!.roles.cache.has(role))
		)
			return data;

		throw language.get(LanguageKeys.Serializers.StickyRoleInvalid);
	}

	public stringify(value: StickyRole, guild: Guild) {
		const username = this.client.users.cache.get(value.user)?.username ?? guild.language.get(LanguageKeys.Misc.UnknownUser);
		const roles = value.roles.map((role) => guild.roles.cache.get(role)?.name ?? guild.language.get(LanguageKeys.Misc.UnknownRole));
		return `[${username} -> ${roles}]`;
	}
}
