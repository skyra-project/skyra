import { Store } from '@sapphire/framework';

const container = Store.injectedContext;
export function setAccurateTimeout<T extends readonly any[]>(fn: (...args: T) => void, delay: number, ...args: T) {
	const end = Date.now() + delay;
	const context: AccurateTimeout<T> = {
		timeout: null!,
		fn,
		cb(...args: T) {
			const remaining = end - Date.now();
			if (remaining < 1) fn(...args);
			// @ts-expect-error: discord.js's typings are wrong
			// eslint-disable-next-line @typescript-eslint/unbound-method
			else context.timeout = container.client.setTimeout(context.cb, delay, ...args);
		},
		stop() {
			clearAccurateTimeout(context);
		}
	};

	// @ts-expect-error: discord.js's typings are wrong
	// eslint-disable-next-line @typescript-eslint/unbound-method
	context.timeout = container.client.setTimeout(context.cb, delay, ...args);
	return context;
}

export function clearAccurateTimeout<T extends readonly any[]>(context: AccurateTimeout<T>) {
	container.client.clearTimeout(context.timeout);
}

export interface AccurateTimeout<T extends readonly any[] = readonly any[]> {
	timeout: NodeJS.Timeout;
	fn(...args: T): void;
	cb(...args: T): void;
	stop(): void;
}
