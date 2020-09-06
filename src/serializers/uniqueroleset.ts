import { UniqueRoleSet } from '@lib/types/settings/GuildSettings';
import { isObject } from '@sapphire/utilities';
import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: UniqueRoleSet, { language, guild }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.name === 'string' &&
			Array.isArray(data.roles) &&
			data.roles.every((role) => typeof role === 'string' && guild!.roles.cache.has(role))
		)
			return data;

		throw language.get('serializerUniqueRoleSetInvalid');
	}

	public stringify(value: UniqueRoleSet, guild: Guild) {
		return `[${value.name} -> ${value.roles.map((role) => guild.roles.cache.get(role)?.name ?? guild.language.get('unknownRole'))}]`;
	}
}
