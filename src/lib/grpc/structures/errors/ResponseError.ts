export class ResponseError extends Error {
	public readonly response: any;

	public constructor(response: any) {
		super(`Received non-OK response (${response.result})`);
		this.response = response;
	}

	public get result(): any {
		return this.response.result;
	}
}
