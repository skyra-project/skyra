import { createReferPromise } from '#utils/common';
import { Client, credentials, ServiceError } from '@grpc/grpc-js';
import { err, ok, Result } from '@sapphire/framework';
import type { Message } from 'google-protobuf';
import { ResponseError, ResultObject } from '../errors/ResponseError';

export abstract class ClientHandler<C extends Client = Client> {
	public abstract readonly client: C;

	public waitForReady() {
		return new Promise<void>((resolve, reject) => {
			this.client.waitForReady(Date.now() + 5000, (error) => (error ? reject(error) : resolve()));
		});
	}

	protected makeCallResult<T extends Message>(cb: ClientHandler.AsyncCall<T>): Promise<Result<T, Error>> {
		const refer = createReferPromise<Result<T, Error>>();

		try {
			cb((error, response) => {
				refer.resolve(error ? err(error) : ok(response));
			});
		} catch (error) {
			refer.resolve(err(error as Error));
		}

		return refer.promise;
	}

	protected async makeCall<T extends ResultObject>(cb: ClientHandler.AsyncCall<Message>): Promise<T> {
		const result = await this.makeCallResult(cb);
		if (!result.success) throw result.error;

		const object = result.value.toObject() as ResultObject;
		if ((object as any).result === 0) return object as T;

		throw new ResponseError(object, this);
	}

	public static getCredentials = credentials.createInsecure;
}

export namespace ClientHandler {
	export interface AsyncCall<T> {
		(cb: (error: ServiceError | null, response: T) => unknown): void;
	}

	export type ResolvedType<T> = T extends string
		? ResponseResolution.String
		: T extends unknown[] | readonly unknown[]
		? ResponseResolution.Array
		: T extends Message
		? ResponseResolution.Message
		: ResponseResolution.Object;

	export const enum ResponseResolution {
		Array,
		Message,
		Object,
		String
	}
}
