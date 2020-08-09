import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';
import { createGunzip, createInflate } from 'zlib';

@ApplyOptions<MiddlewareOptions>({ priority: 20 })
export default class extends Middleware {
	public async run(request: ApiRequest, response: ApiResponse) {
		// If no Content-Type or does not have application/json, do not run this.
		if (!request.headers['content-type']?.startsWith('application/json')) return;

		const stream = this.contentStream(request);
		if (stream === null) return;

		let body = '';
		for await (const chunk of stream) body += chunk;

		try {
			request.body = body === '' ? null : JSON.parse(body);
		} catch {
			response.json({ error: 'Cannot parse JSON data.' });
		}
	}

	private contentStream(request: ApiRequest) {
		const length = request.headers['content-length'];
		switch ((request.headers['content-encoding'] || 'identity').toLowerCase()) {
			case 'deflate': {
				const stream = createInflate();
				request.pipe(stream);
				return stream;
			}
			case 'gzip': {
				const stream = createGunzip();
				request.pipe(stream);
				return stream;
			}
			case 'identity': {
				const stream = request;
				stream.length = Number(length);
				return stream;
			}
		}
		return null;
	}
}
