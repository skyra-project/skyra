import type { Result, Status } from '#lib/grpc/generated';

export class ResponseError extends Error {
	public readonly result: Result.AsObject;

	public constructor(result: Result.AsObject) {
		super(`Received non-OK response: '${result.status}'`);
		this.result = result;
	}

	public get status(): Status {
		return this.result.status;
	}
}
