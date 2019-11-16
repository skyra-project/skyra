import { ServerResponse, STATUS_CODES } from 'http';
import { Mime } from '../../util/constants';

export default class ApiResponse extends ServerResponse {

	public error(error: number | string): void {
		if (typeof error === 'string') {
			return this.status(500).json({ error });
		}

		return this.status(error).json({ error: STATUS_CODES[error] });
	}

	public ok(data?: unknown) {
		this.status(200);
		return typeof data === 'string' ? this.end(data) : this.json(data);
	}

	public status(code: number): this {
		this.statusCode = code;
		return this;
	}

	public json(data: any): void {
		this.end(JSON.stringify(data));
	}

	public setContentType(contentType: Mime.Types) {
		this.setHeader('Content-Type', contentType);
		return this;
	}

}
