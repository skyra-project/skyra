import { envParseString } from '#lib/env';
import { createReferPromise } from '#utils/util';
import { Client, ClientReadableStream, credentials, ServiceError } from '@grpc/grpc-js';
import type { NonNullObject } from '@sapphire/utilities';
import type { Message } from 'google-protobuf';
import { Result, Status } from '../../generated/shared_pb';
import { ResponseError } from '../errors/ResponseError';

export abstract class ClientHandler<C extends Client = Client> {
	public available = false;
	public abstract readonly client: C;

	public waitForReady() {
		return new Promise<void>((resolve, reject) => {
			this.client.waitForReady(Date.now() + 5000, (error) => {
				if (error) {
					return reject(error);
				}

				this.available = true;
				resolve();
			});
		});
	}

	public close() {
		this.available = false;
		this.client.close();
	}

	protected makeCall<T extends Result.AsObject = Result.AsObject>(cb: ClientHandler.AsyncCall<Message>): Promise<T> {
		const refer = createReferPromise<T>();

		try {
			cb((error, response) => {
				if (error === null) {
					const parsed = response.toObject() as T;
					if (parsed.status === Status.SUCCESS) refer.resolve(parsed);
					else refer.reject(new ResponseError(parsed));
				} else {
					refer.reject(error);
				}
			});
		} catch (error) {
			refer.reject(error);
		}

		return refer.promise;
	}

	protected async *makeStream<T extends NonNullObject>(stream: ClientReadableStream<Message>): AsyncIterableIterator<T> {
		for await (const raw of stream) {
			const item = (raw as Message).toObject() as T;
			yield item;
		}
	}

	public static address = envParseString('GRPC_ADDRESS');
	public static getCredentials = credentials.createInsecure;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
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
