import { Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {

	public deserialize(data: string, entry: SchemaEntry, language: Language) {
		try {
			const { hostname } = new URL(data);
			return hostname.length > 128 ? Promise.reject(language.tget('RESOLVER_MINMAX_MAX', entry.path, 128, true)) : Promise.resolve(hostname);
		} catch {
			return Promise.reject(language.tget('RESOLVER_INVALID_URL', entry.path));
		}
	}

	public stringify(data: string) {
		return `https://${data}`;
	}

}
