import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const command = this.context.client.commands.get(value);
		if (command) return this.ok(command.name);
		return this.error(t(LanguageKeys.Resolvers.InvalidCommand, { name: entry.name }));
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.context.client.commands.has(value);
		if (!guild) throw t(LanguageKeys.Resolvers.InvalidCommand, { name: entry.name });
		return true;
	}

	public stringify(value: string) {
		return (this.context.client.commands.get(value) || { name: value }).name;
	}
}
