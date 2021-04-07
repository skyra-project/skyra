import { envParseInteger } from '#lib/env';
import { cpus } from 'os';
import type {
	IncomingPayload,
	IncomingRunGuildRegExpPayload,
	IncomingUpdateGuildRegExpPayload,
	NoId,
	OutgoingNoContentPayload,
	OutgoingRegExpMatchPayload
} from './types';
import { WorkerHandler } from './WorkerHandler';

export class WorkerManager {
	public readonly workers: WorkerHandler[] = [];

	public constructor(count = envParseInteger('WORKER_COUNT', cpus().length)) {
		for (let i = 0; i < count; ++i) {
			this.workers.push(new WorkerHandler());
		}
	}

	/**
	 * Starts all workers.
	 */
	public async start() {
		await Promise.all(this.workers.map((worker) => worker.start()));
	}

	public async send(data: NoId<IncomingUpdateGuildRegExpPayload>, delay?: number): Promise<OutgoingNoContentPayload>;
	public async send(data: NoId<IncomingRunGuildRegExpPayload>, delay?: number): Promise<OutgoingNoContentPayload | OutgoingRegExpMatchPayload>;
	public async send(data: NoId<IncomingPayload>, delay?: number) {
		return this.getIdealWorker().send(data, delay);
	}

	/**
	 * Destroys all workers.
	 */
	public async destroy() {
		await Promise.all(this.workers.map((worker) => worker.destroy()));
	}

	private getIdealWorker() {
		return this.workers.reduce((best, worker) => (worker.remaining > best.remaining ? best : worker));
	}
}
