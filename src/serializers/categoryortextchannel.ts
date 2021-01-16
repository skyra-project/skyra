import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry, guild }: SerializerUpdateContext) {
		const channel = guild.channels.cache.get(value);
		if (!channel) {
			return this.error(t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name }));
		}

		if (channel.type === 'text' || channel.type === 'category') {
			return this.ok(channel.id);
		}

		return this.error(t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
