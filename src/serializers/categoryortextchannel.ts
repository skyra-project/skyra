import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<string> {
		const channel = context.entity.guild.channels.cache.get(value);
		if (!channel) {
			// TODO(kyranet): Localize this.
			throw new Error('The channel does not exist.');
		}

		if (channel.type === 'text' || channel.type === 'category') {
			return channel.id;
		}

		throw context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name });
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return context.entity.guild.channels.cache.has(value);
	}

	public stringify(data: string, context: SerializerUpdateContext): string {
		return context.entity.guild.channels.cache.get(data)?.name ?? 'Unknown';
	}
}
