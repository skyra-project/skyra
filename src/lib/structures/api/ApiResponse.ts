import { Mime } from '@utils/constants';
import { ServerResponse, STATUS_CODES } from 'http';

export default class ApiResponse extends ServerResponse {

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

	public badRequest(data: unknown = STATUS_CODES[400]) {
		this.status(400);
		return typeof data === 'string' ? this.text(data) : this.json(data);
	}

	public forbidden(data: unknown = STATUS_CODES[403]) {
		this.status(403);
		return typeof data === 'string' ? this.text(data) : this.json(data);
	}

	public status(code: number): this {
		this.statusCode = code;
		return this;
	}

	public json(data: any): void {
		this.setContentType(Mime.Types.ApplicationJson)
			.end(JSON.stringify(data));
	}

	public text(data: string): void {
		this.setContentType(Mime.Types.TextPlain)
			.end(data);
	}

	public setContentType(contentType: Mime.Types) {
		this.setHeader('Content-Type', contentType);
		return this;
	}

}
