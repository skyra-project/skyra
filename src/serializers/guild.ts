import { Serializer } from '@lib/database';
import { Guild } from 'discord.js';

export default class UserSerializer extends Serializer {
	public validate(data, { entry, language }) {
		if (data instanceof Guild) return data;
		const guild = Serializer.regex.channel.test(data) ? this.client.guilds.cache.get(data) : null;
		if (guild) return guild;
		throw language.get('resolverInvalidGuild', { name: entry.key });
	}

	public serialize(value) {
		return value.id;
	}

	public stringify(value) {
		return (this.client.guilds.cache.get(value) || { name: value }).name;
	}
}
