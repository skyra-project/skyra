import { ServerResponse, STATUS_CODES } from 'http';

export default class ApiResponse extends ServerResponse {

	public error(error: number | string): void {
		if (typeof error === 'string') {
			return this.status(500).json({ error });
		}

		return this.status(error).json({ error: STATUS_CODES[error] });
	}

	public status(code: number): this {
		this.statusCode = code;
		return this;
	}

	public json(data: any): void {
		this.end(JSON.stringify(data));
	}

}
