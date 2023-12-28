/* eslint-disable @typescript-eslint/dot-notation */
import { TimeoutError, WorkerResponseHandler } from '#lib/moderation/workers';

describe('WorkerHandler', () => {
	test('GIVEN new instance THEN has initial data', () => {
		const handler = new WorkerResponseHandler();
		expect(handler['id']).toBe(-1);
		expect(handler['handler']).toBeNull();
		expect(handler['timer']).toBeNull();
	});

	test('GIVEN matching id in resolve THEN resolves the promise', async () => {
		const handler = new WorkerResponseHandler();

		const id = 1;
		const data = { id, type: 0, filtered: '', highlighted: '' };

		const promise = handler.define(id);
		expect(handler['handler']).not.toBeNull();

		const resolve = vi.spyOn(handler['handler']!, 'resolve');
		const reject = vi.spyOn(handler['handler']!, 'reject');

		handler.resolve(id, data);
		expect(resolve).toBeCalledTimes(1);
		expect(reject).not.toBeCalled();

		await expect(promise).resolves.toBe(data);
	});

	test('GIVEN mismatching id in resolve THEN does not resolve the promise', async () => {
		const handler = new WorkerResponseHandler();

		const id = 1;
		const data = { id, type: 0, filtered: '', highlighted: '' };

		const promise = handler.define(id);
		expect(handler['handler']).not.toBeNull();

		const resolve = vi.spyOn(handler['handler']!, 'resolve');
		const reject = vi.spyOn(handler['handler']!, 'reject');

		handler.resolve(id + 1, data);
		expect(resolve).not.toBeCalled();
		expect(reject).not.toBeCalled();

		handler.resolve(id, data);
		expect(resolve).toBeCalledTimes(1);
		expect(reject).not.toBeCalled();

		await expect(promise).resolves.toBe(data);
	});

	test('GIVEN matching id in reject THEN rejects the promise', async () => {
		const handler = new WorkerResponseHandler();

		const id = 1;
		const error = new Error('Hello there!');

		const promise = handler.define(id);
		expect(handler['handler']).not.toBeNull();

		const resolve = vi.spyOn(handler['handler']!, 'resolve');
		const reject = vi.spyOn(handler['handler']!, 'reject');

		handler.reject(id, error);
		expect(resolve).not.toBeCalled();
		expect(reject).toBeCalledTimes(1);

		await expect(promise).rejects.toBe(error);
	});

	test('GIVEN mismatching id in reject THEN does not reject the promise', async () => {
		const handler = new WorkerResponseHandler();

		const id = 1;
		const error = new Error('Hello there!');

		const promise = handler.define(id);
		expect(handler['handler']).not.toBeNull();

		const resolve = vi.spyOn(handler['handler']!, 'resolve');
		const reject = vi.spyOn(handler['handler']!, 'reject');

		handler.reject(id + 1, error);
		expect(resolve).not.toBeCalled();
		expect(reject).not.toBeCalled();

		handler.reject(id, error);
		expect(resolve).not.toBeCalled();
		expect(reject).toBeCalledTimes(1);

		await expect(promise).rejects.toBe(error);
	});

	test('GIVEN 5ms timeout WHEN there is no timeout and no pending task THEN returns false and does not clear timeout', () => {
		const handler = new WorkerResponseHandler();

		const clearTimeout = vi.spyOn(handler, 'clearTimeout' as any);

		expect(handler.timeout(5)).toBe(false);
		expect(handler['timer']).toBeNull();
		expect(clearTimeout).not.toHaveBeenCalled();
	});

	test('GIVEN timeout WHEN there is no timeout but has a pending task THEN returns true and does clear timeout', async () => {
		const handler = new WorkerResponseHandler();

		const clearTimeout = vi.spyOn(handler, 'clearTimeout' as any);

		const id = 1;
		const promise = handler.define(id);

		expect(handler.timeout(5)).toBe(true);
		expect(handler['timer']).not.toBeNull();
		expect(clearTimeout).toHaveBeenCalledTimes(1);
		expect(clearTimeout).toHaveLastReturnedWith(false);

		await expect(promise).rejects.toBeInstanceOf(TimeoutError);

		expect(handler['id']).toBe(-1);
		expect(handler['handler']).toBeNull();
		expect(handler['timer']).toBeNull();
		expect(clearTimeout).toHaveBeenCalledTimes(2);
		expect(clearTimeout).toHaveLastReturnedWith(true);
	});

	test('GIVEN timeout WHEN there was a timeout and a pending task THEN returns true and does clear timeout', async () => {
		const handler = new WorkerResponseHandler();

		const clearTimeout = vi.spyOn(handler, 'clearTimeout' as any);

		const id = 1;
		const promise = handler.define(id);

		expect(handler.timeout(5)).toBe(true);
		expect(handler['timer']).not.toBeNull();
		expect(clearTimeout).toHaveBeenCalledTimes(1);
		expect(clearTimeout).toHaveLastReturnedWith(false);

		expect(handler.timeout(12)).toBe(true);
		expect(handler['timer']).not.toBeNull();
		expect(clearTimeout).toHaveBeenCalledTimes(2);
		expect(clearTimeout).toHaveLastReturnedWith(true);

		await expect(promise).rejects.toBeInstanceOf(TimeoutError);
	});

	test('GIVEN no timeout WHEN there was no pending task nor timeout THEN returns false', () => {
		const handler = new WorkerResponseHandler();

		const clearTimeout = vi.spyOn(handler, 'clearTimeout' as any);

		expect(handler.timeout(null)).toBe(false);
		expect(handler['timer']).toBeNull();
		expect(clearTimeout).toHaveBeenCalledTimes(1);
		expect(clearTimeout).toHaveLastReturnedWith(false);
	});
});
