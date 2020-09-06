import { Channel, Guild } from 'discord.js';
import { Language, SchemaEntry, Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	// eslint-disable-next-line @typescript-eslint/require-await
	public async validate(data: string | Channel, { entry, language, guild }: SerializerUpdateContext) {
		if (data instanceof Channel) return this.checkChannel(data, entry, language);
		const channel = Serializer.regex.channel.test(data)
			? (guild || this.client).channels.cache.get(Serializer.regex.channel.exec(data)![1])
			: null;
		if (channel) return this.checkChannel(channel, entry, language);
		throw language.get('resolverInvalidChannel', { name: entry.key });
	}

	public serialize(value: Channel) {
		return value.id;
	}

	public stringify(value: string, guild: Guild) {
		return guild.channels.cache.get(value)!.name;
	}

	private checkChannel(data: Channel, entry: SchemaEntry, language: Language) {
		if (data.type === 'text' || data.type === 'category') return data;
		throw language.get('resolverInvalidChannel', { name: entry.key });
	}
}
