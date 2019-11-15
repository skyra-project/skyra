import { Language, SchemaEntry, Serializer } from 'klasa';
import { resolveEmoji } from '../lib/util/util';

export default class extends Serializer {

	public deserialize(data: string, entry: SchemaEntry, language: Language) {
		const resolved = resolveEmoji(data);
		if (resolved === null) return Promise.reject(language.tget('RESOLVER_INVALID_EMOJI', entry.path));
		return Promise.resolve(resolved);
	}

	public stringify(data: string) {
		return data.startsWith('%') ? decodeURIComponent(data) : `<${data}>`;
	}

}
