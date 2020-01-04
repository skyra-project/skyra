import { Serializer, SerializerUpdateContext } from 'klasa';
import { resolveEmoji } from '@util/util';

export default class extends Serializer {

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		const resolved = resolveEmoji(data);
		if (resolved === null) return Promise.reject(language.tget('RESOLVER_INVALID_EMOJI', entry.path));
		return Promise.resolve(resolved);
	}

	public stringify(data: string) {
		return data.startsWith('%') ? decodeURIComponent(data) : `<${data}>`;
	}

}
