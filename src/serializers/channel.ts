import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Channel, Guild } from 'discord.js';
import { Language, SchemaEntry, Serializer, SerializerOptions, SerializerUpdateContext } from 'klasa';

@ApplyOptions<SerializerOptions>({
	aliases: ['textchannel', 'voicechannel', 'categorychannel']
})
export default class extends Serializer {
	public validate(data: string | Channel, { entry, language, guild }: SerializerUpdateContext) {
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

	public stringify(value: any, guild: Guild) {
		return (
			(guild && guild.channels.cache.get(value)) || {
				name: (value && value.name) || value
			}
		).name;
	}

	private checkChannel(data: Channel, entry: SchemaEntry, language: Language) {
		if (
			entry.type === 'channel' ||
			(entry.type === 'textchannel' && data.type === 'text') ||
			(entry.type === 'textchannel' && data.type === 'news') ||
			(entry.type === 'textchannel' && data.type === 'store') ||
			(entry.type === 'voicechannel' && data.type === 'voice') ||
			(entry.type === 'categorychannel' && data.type === 'category')
		)
			return data;
		throw language.get(LanguageKeys.Resolvers.InvalidChannel, { name: entry.key });
	}
}
