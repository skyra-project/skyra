import type { ClientHandler } from '#lib/grpc';

export class ResponseError extends Error {
	public readonly response: ResultObject;
	public readonly handler: ClientHandler;

	public constructor(response: ResultObject, handler: ClientHandler) {
		super(`Received non-OK response (${response.result})`);
		this.response = response;
		this.handler = handler;
	}

	public get status(): number {
		return this.response.result;
	}
}

export interface ResultObject {
	result: number;
}
