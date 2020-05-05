import { KlasaIncomingMessage, Middleware, MiddlewareStore } from 'klasa-dashboard-hooks';
import { createGunzip, createInflate } from 'zlib';

export default class extends Middleware {

	public constructor(store: MiddlewareStore, file: string[], directory: string) {
		super(store, file, directory, { priority: 20 });
	}

	public async run(request: KlasaIncomingMessage) {
		if (request.method !== 'POST') return;

		const stream = this.contentStream(request);
		let body = '';

		if (typeof stream === 'undefined') return;
		for await (const chunk of stream) body += chunk;

		request.body = JSON.parse(body);
	}

	public contentStream(request: KlasaIncomingMessage) {
		const length = request.headers['content-length'];
		let stream: ReturnType<typeof createInflate> | ReturnType<typeof createGunzip> | KlasaIncomingMessage | undefined = undefined;
		switch ((request.headers['content-encoding'] ?? 'identity').toLowerCase()) {
			case 'deflate':
				stream = createInflate();
				request.pipe(stream);
				break;
			case 'gzip':
				stream = createGunzip();
				request.pipe(stream);
				break;
			case 'identity':
				stream = request;
				stream.length = Number(length);
		}
		return stream;
	}

}
