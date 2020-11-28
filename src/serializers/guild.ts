import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext) {
		const guild = this.client.guilds.cache.get(value);
		if (guild) return this.ok(guild.id);
		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidGuild, { name: context.entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.client.guilds.cache.get(value);
		if (!guild) {
			throw context.language.get(LanguageKeys.Resolvers.InvalidGuild, { name: context.entry.name });
		}

		return true;
	}

	public stringify(value: string) {
		return (this.client.guilds.cache.get(value) || { name: value }).name;
	}
}
