import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('commandName');
		return result.success ? this.ok(result.value.name) : this.errorFromArgument(args, result.error);
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaitable<boolean> {
		const command = this.container.stores.get('commands').has(value);
		if (!command) throw t(LanguageKeys.Serializers.InvalidCommand, { name: entry.name });
		return true;
	}

	public stringify(value: string) {
		return (this.container.stores.get('commands').get(value) || { name: value }).name;
	}
}
