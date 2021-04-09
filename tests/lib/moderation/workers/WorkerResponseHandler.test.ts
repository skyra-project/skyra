/* eslint-disable @typescript-eslint/dot-notation */
import { WorkerResponseHandler } from '#lib/moderation/workers';

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

		const resolve = jest.spyOn(handler['handler']!, 'resolve');
		const reject = jest.spyOn(handler['handler']!, 'reject');

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

		const resolve = jest.spyOn(handler['handler']!, 'resolve');
		const reject = jest.spyOn(handler['handler']!, 'reject');

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

		const resolve = jest.spyOn(handler['handler']!, 'resolve');
		const reject = jest.spyOn(handler['handler']!, 'reject');

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

		const resolve = jest.spyOn(handler['handler']!, 'resolve');
		const reject = jest.spyOn(handler['handler']!, 'reject');

		handler.reject(id + 1, error);
		expect(resolve).not.toBeCalled();
		expect(reject).not.toBeCalled();

		handler.reject(id, error);
		expect(resolve).not.toBeCalled();
		expect(reject).toBeCalledTimes(1);

		await expect(promise).rejects.toBe(error);
	});
});
