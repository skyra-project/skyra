import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Channel, Guild } from 'discord.js';
import { ConfigurableKeyValue, Serializer, SerializerUpdateContext } from '@lib/database';
import { AliasPieceOptions, Language } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['textchannel', 'voicechannel', 'categorychannel']
})
export default class extends Serializer {
	public validate(data: string | Channel, { entry, language, entity }: SerializerUpdateContext) {
		if (data instanceof Channel) return this.checkChannel(data, entry, language);
		const channel = Serializer.regex.channel.test(data) ? entity.guild.channels.cache.get(Serializer.regex.channel.exec(data)![1]) : null;
		if (channel) return this.checkChannel(channel, entry, language);
		throw language.get('resolverInvalidChannel', { name: entry.name });
	}

	public serialize(value: Channel) {
		return value.id;
	}

	// TODO(kyra): fix this
	public stringify(value: any, guild: Guild) {
		return (
			(guild && guild.channels.cache.get(value)) || {
				name: (value && value.name) || value
			}
		).name;
	}

	private checkChannel(data: Channel, entry: ConfigurableKeyValue, language: Language) {
		if (
			entry.type === 'channel' ||
			this.isTextBasedChannel(data, entry) ||
			(entry.type === 'voicechannel' && data.type === 'voice') ||
			(entry.type === 'categorychannel' && data.type === 'category')
		)
			return data;
		throw language.get(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name });
	}

	private isTextBasedChannel(data: Channel, entry: ConfigurableKeyValue): boolean {
		if (entry.type === 'textchannel') {
			return data.type === 'text' || data.type === 'news' || data.type === 'store';
		}

		return false;
	}
}
