import { envParseString } from '#lib/env';
import { rootFolder } from '#utils/constants';
import { AsyncQueue } from '@sapphire/async-queue';
import { Store } from '@sapphire/pieces';
import { cyan, green, red, yellow } from 'colorette';
import { once } from 'events';
import { join } from 'path';
import { Worker } from 'worker_threads';
import { IncomingPayload, NoId, OutgoingPayload, OutgoingType } from './types';
import { WorkerResponseHandler } from './WorkerResponseHandler';

export class WorkerHandler {
	public lastHeartBeat!: number;
	private worker!: Worker;
	private online!: boolean;
	private id = 0;
	private threadID = -1;
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

	public async send(data: NoId<IncomingPayload>, delay = 500) {
		await this.queue.wait();

		try {
			const id = this.generateID();
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
		await this.worker.terminate();
	}

	private generateID() {
		if (this.id === WorkerHandler.maximumID) {
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

		if (WorkerHandler.logsEnabled) {
			const worker = `[${yellow('W')}]`;
			const thread = cyan(this.threadID.toString(16));
			const exit = code === 0 ? green('0') : red(code.toString());
			Store.injectedContext.logger.warn(`${worker} - Thread ${thread} closed with code ${exit}.`);
		}
	}

	private handleOnline() {
		this.online = true;
		this.threadID = this.worker.threadId;

		if (WorkerHandler.logsEnabled) {
			const worker = `[${cyan('W')}]`;
			const thread = cyan(this.threadID.toString(16));
			Store.injectedContext.logger.info(`${worker} - Thread ${thread} is now ready.`);
		}
	}

	private static readonly workerTsLoader = join(rootFolder, 'scripts', 'workerTsLoader.js');
	private static readonly logsEnabled = process.env.NODE_ENV !== 'test';
	private static readonly filename = join(__dirname, `worker.${envParseString('NODE_ENV') === 'test' ? 't' : 'j'}s`);
	private static readonly maximumID = Number.MAX_SAFE_INTEGER;
}
