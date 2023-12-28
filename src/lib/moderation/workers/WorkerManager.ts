import { envParseInteger } from '@skyra/env-utilities';
import { cpus } from 'node:os';
import type {
	IncomingPayload,
	IncomingRunRegExpPayload,
	NoId,
	OutgoingNoContentPayload,
	OutgoingRegExpMatchPayload
} from '#lib/moderation/workers/types';
import { WorkerHandler } from '#lib/moderation/workers/WorkerHandler';

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

	public send(data: NoId<IncomingRunRegExpPayload>, delay?: number | null): Promise<OutgoingNoContentPayload | OutgoingRegExpMatchPayload>;
	public send(data: NoId<IncomingPayload>, delay?: number | null) {
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
