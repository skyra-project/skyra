import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Guild } from 'discord.js';

export default class extends Serializer {
	public validate(data: [string, number], { language }: SerializerUpdateContext) {
		if (
			Array.isArray(data) &&
			data.length === 2 &&
			typeof data[0] === 'string' &&
			typeof data[1] === 'number' &&
			this.client.commands.has(data[0])
		)
			return data;

		throw language.get(LanguageKeys.Serializers.CommandAutoDeleteInvalid);
	}

	public stringify(value: [string, number], guild: Guild) {
		return `[${value[0]} -> ${guild.language.duration(value[1], 2)}]`;
	}
}
