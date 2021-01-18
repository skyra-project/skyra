import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { map } from '#utils/iterator';
import type { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	private possibles: readonly string[] = [];

	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const exists = this.context.client.i18n.languages.has(value);
		if (exists) return this.ok(value);
		return this.error(t(LanguageKeys.Resolvers.InvalidLanguage, { name: entry.name, possibles: this.possibles }));
	}

	public isValid(value: string): Awaited<boolean> {
		return this.context.client.i18n.languages.has(value);
	}

	public init() {
		this.possibles = [...map(this.context.client.i18n.languages.keys(), (key) => `\`${key}\``)];
		return Promise.resolve();
	}
}
