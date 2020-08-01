import { Serializer, SerializerUpdateContext, SchemaEntry, Language } from 'klasa';
import { Channel, Guild } from 'discord.js';

export default class extends Serializer {

	checkChannel(data: Channel, entry: SchemaEntry, language: Language) {
		if (data.type === 'text' || data.type === 'category') return data;
		throw language.tget('RESOLVER_INVALID_CHANNEL', entry.key);
	}

	async validate(data: string | Channel, { entry, language, guild }: SerializerUpdateContext) {
		if (data instanceof Channel) return this.checkChannel(data, entry, language);
		const channel = Serializer.regex.channel.test(data) ? (guild || this.client).channels.get(Serializer.regex.channel.exec(data)![1]) : null;
		if (channel) return this.checkChannel(channel, entry, language);
		throw language.get('RESOLVER_INVALID_CHANNEL', entry.key);
	}

	serialize(value: Channel) {
		return value.id;
	}

	stringify(value: string, guild: Guild) {
		return guild.channels.get(value)!.name;
	}

};
