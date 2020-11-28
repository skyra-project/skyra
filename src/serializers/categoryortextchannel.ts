import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext) {
		const channel = context.guild.channels.cache.get(value);
		if (!channel) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name }));
		}

		if (channel.type === 'text' || channel.type === 'category') {
			return this.ok(channel.id);
		}

		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
