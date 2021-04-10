import { envParseInteger } from '#lib/env';
import { cpus } from 'os';
import type { IncomingPayload, IncomingRunRegExpPayload, NoId, OutgoingNoContentPayload, OutgoingRegExpMatchPayload } from './types';
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

	public async send(data: NoId<IncomingRunRegExpPayload>, delay?: number | null): Promise<OutgoingNoContentPayload | OutgoingRegExpMatchPayload>;
	public async send(data: NoId<IncomingPayload>, delay?: number | null) {
		return this.getIdealWorker().send(data, delay);
	}

	/**
	 * Destroys all workers.
	 */
	public async destroy() {
		await Promise.all(this.workers.map((worker) => worker.destroy()));
	}

	private getIdealWorker() {
		return this.workers.reduce((best, worker) => (best.remaining > worker.remaining ? worker : best));
	}
}
