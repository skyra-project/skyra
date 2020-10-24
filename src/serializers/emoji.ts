import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '@utils/util';

export default class extends Serializer {
	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		const resolved = resolveEmoji(data);
		if (resolved === null) return Promise.reject(language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: entry.path }));
		return Promise.resolve(resolved);
	}

	public stringify(data: string) {
		return data.startsWith('%') ? decodeURIComponent(data) : `<${data}>`;
	}
}
