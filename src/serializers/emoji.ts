import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '#utils/util';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const resolved = resolveEmoji(value);
		if (resolved === null) {
			return this.error(t(LanguageKeys.Resolvers.InvalidEmoji, { name: entry.name }));
		}

		return this.ok(resolved);
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const resolved = resolveEmoji(value);
		if (resolved === null || value !== resolved) {
			throw new Error(t(LanguageKeys.Resolvers.InvalidEmoji, { name: entry.name }));
		}

		return true;
	}

	public stringify(data: string) {
		return data.startsWith('%') ? decodeURIComponent(data) : `<${data}>`;
	}
}
