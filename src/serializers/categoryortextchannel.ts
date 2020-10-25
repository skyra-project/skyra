import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Channel, Guild } from 'discord.js';
import { ConfigurableKeyValue, Serializer, SerializerUpdateContext } from '@lib/database';
import { Language } from 'klasa';

export default class extends Serializer {
	// eslint-disable-next-line @typescript-eslint/require-await
	public async validate(data: string | Channel, { entry, language, entity }: SerializerUpdateContext) {
		if (data instanceof Channel) return this.checkChannel(data, entry, language);
		const channel = Serializer.regex.channel.test(data) ? entity.guild.channels.cache.get(Serializer.regex.channel.exec(data)![1]) : null;
		if (channel) return this.checkChannel(channel, entry, language);
		throw language.get(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name });
	}

	public serialize(value: Channel) {
		return value.id;
	}

	public stringify(value: string, guild: Guild) {
		return guild.channels.cache.get(value)!.name;
	}

	private checkChannel(data: Channel, entry: ConfigurableKeyValue, language: Language) {
		if (data.type === 'text' || data.type === 'category') return data;
		throw language.get(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name });
	}
}
