import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';

export default class UserSerializer extends Serializer {
	private readonly kProtocol = /^https?:\/\//;

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
