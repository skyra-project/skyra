import { Serializer } from '@lib/database';
import { Role } from 'discord.js';

export default class UserSerializer extends Serializer {
	public async validate(data, { entry, language, guild }) {
		if (!guild) throw this.client.languages.default.get('resolverInvalidGuild', entry.key);
		if (data instanceof Role) return data;
		const role = this.constructor.regex.role.test(data)
			? guild.roles.cache.get(this.constructor.regex.role.exec(data)[1])
			: guild.roles.cache.find((rol) => rol.name === data) || null;
		if (role) return role;
		throw language.get('resolverInvalidRole', { name: entry.key });
	}

	public serialize(value) {
		return value.id;
	}

	public stringify(value, guild) {
		return (
			(guild && guild.roles.cache.get(value)) || {
				name: (value && value.name) || value
			}
		).name;
	}
}
