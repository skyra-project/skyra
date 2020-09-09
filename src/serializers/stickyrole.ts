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
			data.roles.every((role) => typeof role === 'string' && guild!.roles.cache.has(role))
		)
			return data;

		throw language.get('serializerStickyRoleInvalid');
	}

	public stringify(value: StickyRole, guild: Guild) {
		const username = this.client.users.cache.get(value.user)?.username ?? guild.language.get('unknownUser');
		const roles = value.roles.map((role) => guild.roles.cache.get(role)?.name ?? guild.language.get('unknownRole'));
		return `[${username} -> ${roles}]`;
	}
}
