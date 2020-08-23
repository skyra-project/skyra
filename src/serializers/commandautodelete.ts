import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

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

		throw language.get('serializerCommandAutoDeleteInvalid');
	}

	public stringify(value: [string, number], guild: Guild) {
		return `[${value[0]} -> ${guild.language.duration(value[1], 2)}]`;
	}
}
