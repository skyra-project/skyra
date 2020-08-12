import { Mime } from '@utils/constants';
import { ServerResponse, STATUS_CODES } from 'http';
import { CookieStore } from './CookieStore';

export class ApiResponse extends ServerResponse {
	public cookies!: CookieStore;

	public error(error: number | string): void {
		if (typeof error === 'string') {
			return this.status(500).json({ error });
		}

		return this.status(error).json({ error: STATUS_CODES[error] });
	}

	public ok(data: unknown = STATUS_CODES[200]) {
		this.status(200);
		return typeof data === 'string' ? this.text(data) : this.json(data);
	}

	public noContent() {
		return this.status(204).end();
	}

	public badRequest(data: unknown = STATUS_CODES[400]) {
		return this.status(400).json({ reason: data });
	}

	public unauthorized(data: unknown = STATUS_CODES[401]) {
		return this.status(401).json({ reason: data });
	}

	public forbidden(data: unknown = STATUS_CODES[403]) {
		return this.status(403).json({ reason: data });
	}

	public notFound(data: unknown = STATUS_CODES[404]) {
		return this.status(404).json({ reason: data });
	}

	public status(code: number): this {
		this.statusCode = code;
		return this;
	}

	public json(data: any): void {
		this.setContentType(Mime.Types.ApplicationJson).end(JSON.stringify(data));
	}

	public text(data: string): void {
		this.setContentType(Mime.Types.TextPlain).end(data);
	}

	public setContentType(contentType: Mime.Types) {
		this.setHeader('Content-Type', contentType);
		return this;
	}
}
