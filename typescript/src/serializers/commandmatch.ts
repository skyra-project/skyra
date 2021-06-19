import { CommandMatcher, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('commandMatch');
		return result.success ? this.ok(result.value) : this.errorFromArgument(args, result.error);
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const command = CommandMatcher.resolve(value);
		if (!command) throw t(LanguageKeys.Serializers.InvalidCommand, { name: entry.name });
		return true;
	}

	public stringify(value: string) {
		return (this.context.stores.get('commands').get(value) || { name: value }).name;
	}
}
