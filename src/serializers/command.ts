import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('commandName');
		return result.success ? this.ok(result.value.name) : result;
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.context.stores.get('commands').has(value);
		if (!guild) throw t(LanguageKeys.Resolvers.InvalidCommand, { name: entry.name });
		return true;
	}

	public stringify(value: string) {
		return (this.context.stores.get('commands').get(value) || { name: value }).name;
	}
}
