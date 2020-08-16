import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	private readonly kProtocol = /^https?:\/\//;

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		try {
			const { hostname } = new URL(this.kProtocol.test(data) ? data : `https://${data}`);
			return hostname.length > 128
				? Promise.reject(language.tget('RESOLVER_MINMAX_MAX', { name: entry.path, max: 128, inclusive: true }))
				: Promise.resolve(hostname);
		} catch {
			return Promise.reject(language.tget('RESOLVER_INVALID_URL', { name: entry.path }));
		}
	}

	public stringify(data: string) {
		return `https://${data}`;
	}
}
