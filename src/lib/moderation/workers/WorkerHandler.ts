import { rootFolder } from '#utils/constants';
import { AsyncQueue } from '@sapphire/async-queue';
import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { cyan, green, red, yellow } from 'colorette';
import { once } from 'node:events';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { IncomingPayload, NoId, OutgoingPayload, OutgoingType } from './types';
import { WorkerResponseHandler } from './WorkerResponseHandler';

export class WorkerHandler {
	public lastHeartBeat!: number;
	private worker!: Worker;
	private online!: boolean;
	private id = 0;
	private threadId = -1;
	private queue = new AsyncQueue();
	private response = new WorkerResponseHandler();

	public constructor() {
		this.spawn();
	}

	/**
	 * The remaining tasks to run in the queue.
	 */
	public get remaining() {
		return this.queue.remaining;
	}

	public async send(data: NoId<IncomingPayload>, delay: number | null = null) {
		await this.queue.wait();

		try {
			const id = this.generateId();
			this.worker.postMessage({ ...data, id });

			const promise = this.response.define(id);
			this.response.timeout(delay);

			return await promise;
		} catch (error) {
			await this.restart();
			throw error;
		} finally {
			this.queue.shift();
		}
	}

	/**
	 * Destroys and restarts the internal worker.
	 */
	public async restart() {
		await this.destroy();
		await this.spawn().start();
	}

	/**
	 * Spawns a new internal worker.
	 * @returns The WorkerHandler instance.
	 */
	public spawn() {
		this.online = false;
		this.lastHeartBeat = 0;
		this.worker = new Worker(WorkerHandler.workerTsLoader, {
			workerData: {
				path: WorkerHandler.filename
			}
		});
		this.worker.on('message', (message: OutgoingPayload) => this.handleMessage(message));
		this.worker.once('online', () => this.handleOnline());
		this.worker.once('exit', (code: number) => this.handleExit(code));
		return this;
	}

	/**
	 * Starts the internal worker.
	 */
	public async start() {
		if (!this.online) await once(this.worker, 'online');
	}

	/**
	 * Terminates the internal worker.
	 */
	public async destroy() {
		this.response.destroy();
		await this.worker.terminate();
	}

	private generateId() {
		/* istanbul ignore if: extremely unlikely to happen, needs 9 quadrillion iterations */
		if (this.id === WorkerHandler.maximumId) {
			return (this.id = 0);
		}

		return this.id++;
	}

	private handleMessage(message: OutgoingPayload) {
		if (message.type === OutgoingType.Heartbeat) {
			this.lastHeartBeat = Date.now();
			return;
		}

		this.response.resolve(message.id, message);
	}

	private handleExit(code: number) {
		this.online = false;
		this.worker.removeAllListeners();

		/* istanbul ignore if: logs are disabled in tests */
		if (WorkerHandler.logsEnabled) {
			const worker = `[${yellow('W')}]`;
			const thread = cyan(this.threadId.toString(16));
			const exit = code === 0 ? green('0') : red(code.toString());
			container.logger.warn(`${worker} - Thread ${thread} closed with code ${exit}.`);
		}
	}

	private handleOnline() {
		this.online = true;
		this.threadId = this.worker.threadId;

		/* istanbul ignore if: logs are disabled in tests */
		if (WorkerHandler.logsEnabled) {
			const worker = `[${cyan('W')}]`;
			const thread = cyan(this.threadId.toString(16));
			container.logger.info(`${worker} - Thread ${thread} is now ready.`);
		}
	}

	private static readonly workerTsLoader = join(rootFolder, 'scripts', 'workerTsLoader.js');
	private static readonly logsEnabled = process.env.NODE_ENV !== 'test';
	private static readonly filename = join(__dirname, `worker.${envParseString('NODE_ENV') === 'test' ? 't' : 'j'}s`);
	private static readonly maximumId = Number.MAX_SAFE_INTEGER;
}
