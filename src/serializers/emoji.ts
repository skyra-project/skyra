import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { resolveEmoji } from '@utils/util';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext) {
		const resolved = resolveEmoji(value);
		if (resolved === null) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: context.entry.name }));
		}

		return this.ok(resolved);
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		const resolved = resolveEmoji(value);
		if (resolved === null || value !== resolved) {
			throw new Error(context.language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: context.entry.name }));
		}

		return true;
	}

	public stringify(data: string) {
		return data.startsWith('%') ? decodeURIComponent(data) : `<${data}>`;
	}
}
