import { promisify } from 'util';

interface PromisifiedTimeout {
	(ms: number): Promise<void>;
	<T>(ms: number, value: T): Promise<T>;
}

/**
 * Promisified version of setTimeout for use with await
 * @param delay The amount of time in ms to delay
 * @param args Any args to pass to the .then (mostly pointless in this form)
 */
export const sleep: PromisifiedTimeout = promisify(setTimeout);
