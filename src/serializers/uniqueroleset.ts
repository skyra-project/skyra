import { Serializer, SerializerUpdateContext } from 'klasa';
import { Guild } from 'discord.js';
import { UniqueRoleSet } from '@lib/types/settings/GuildSettings';
import { isObject } from '@klasa/utils';

export default class extends Serializer {

	public validate(data: UniqueRoleSet, { language, guild }: SerializerUpdateContext) {
		if (isObject(data)
			&& Object.keys(data).length === 2
			&& typeof data.name === 'string'
			&& Array.isArray(data.roles)
			&& data.roles.every(role => typeof role === 'string' && guild!.roles.has(role))) return data;

		throw language.tget('SERIALIZER_UNIQUE_ROLE_SET_INVALID');
	}

	public stringify(value: UniqueRoleSet, guild: Guild) {
		return `[${value.name} -> ${value.roles.map(role => guild.roles.get(role)?.name ?? guild.language.tget('UNKNOWN_ROLE'))}]`;
	}

}
