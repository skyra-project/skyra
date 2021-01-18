import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const guild = this.context.client.guilds.cache.get(value);
		if (guild) return this.ok(guild.id);
		return this.error(t(LanguageKeys.Resolvers.InvalidGuild, { name: entry.name }));
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.context.client.guilds.cache.get(value);
		if (!guild) {
			throw t(LanguageKeys.Resolvers.InvalidGuild, { name: entry.name });
		}

		return true;
	}

	public stringify(value: string) {
		return (this.context.client.guilds.cache.get(value) || { name: value }).name;
	}
}
