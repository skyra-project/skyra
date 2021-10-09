import { container, err, ok, Result } from '@sapphire/framework';
import { Awaitable, isThenable } from '@sapphire/utilities';
import type { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { DiscordAPIError } from 'discord.js';

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error) {
		if (error instanceof DiscordAPIError && codes.includes(error.code)) return null;
		throw error;
	}
}

export function floatPromise(promise: Awaitable<unknown>) {
	if (isThenable(promise)) promise.catch((error: Error) => container.logger.fatal(error));
}

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

/**
 * Create a referred promise.
 */
export function createReferPromise<T>(): ReferredPromise<T> {
	let resolve: (value: T) => void;
	let reject: (error?: Error) => void;
	const promise: Promise<T> = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// noinspection JSUnusedAssignment
	return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Wraps the result of a promise into a Result<T, E>, resulting on Ok<T> when successful, and Err<E> when erroneous.
 * This function's purpose is to create promises that do not reject, allowing code to be written without try/catch or
 * {@link Promise.catch} callbacks.
 * @param promise The promise to wrap into a Result<T, E>
 * @returns A promise resolving to a Result.
 */
export async function safeWrapPromise<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
	try {
		return ok(await promise);
	} catch (error) {
		return err(error as E);
	}
}
