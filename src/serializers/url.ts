import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	private readonly kProtocol = /^https?:\/\//;

	public parse(value: string, { language, entry }: SerializerUpdateContext): Awaited<string> {
		try {
			const { hostname } = new URL(this.kProtocol.test(value) ? value : `https://${value}`);
			if (hostname.length <= 128) return hostname;
			throw new Error('💥');
		} catch {
			throw new Error(language.get(LanguageKeys.Resolvers.MinmaxMaxInclusive, { name: entry.name, max: 128 }));
		}
	}

	public isValid(value: string, { language, entry }: SerializerUpdateContext): Awaited<boolean> {
		try {
			const { hostname } = new URL(this.kProtocol.test(value) ? value : `https://${value}`);
			return hostname.length <= 128;
		} catch (error) {
			throw new Error(language.get(LanguageKeys.Resolvers.InvalidUrl, { name: entry.name }));
		}
	}

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		try {
			const { hostname } = new URL(this.kProtocol.test(data) ? data : `https://${data}`);
			return hostname.length > 128
				? Promise.reject(language.get(LanguageKeys.Resolvers.MinmaxMaxInclusive, { name: entry.name, max: 128 }))
				: Promise.resolve(hostname);
		} catch {
			return Promise.reject(language.get(LanguageKeys.Resolvers.InvalidUrl, { name: entry.name }));
		}
	}

	public stringify(data: string) {
		return `https://${data}`;
	}
}
