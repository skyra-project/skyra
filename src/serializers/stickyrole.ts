import { StickyRole } from '@lib/types/settings/GuildSettings';
import { isObject } from '@sapphire/utilities';
import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: StickyRole, { language, guild }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.user === 'string' &&
			Array.isArray(data.roles) &&
			data.roles.every((role) => typeof role === 'string' && guild!.roles.has(role))
		)
			return data;

		throw language.get('SERIALIZER_STICKY_ROLE_INVALID');
	}

	public stringify(value: StickyRole, guild: Guild) {
		const username = this.client.userTags.get(value.user)?.username ?? guild.language.get('UNKNOWN_USER');
		const roles = value.roles.map((role) => guild.roles.get(role)?.name ?? guild.language.get('UNKNOWN_ROLE'));
		return `[${username} -> ${roles}]`;
	}
}
