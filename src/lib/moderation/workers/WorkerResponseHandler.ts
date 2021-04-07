import { createReferPromise, ReferredPromise } from '#utils/util';
import { TimerManager } from '@sapphire/time-utilities';
import { TimeoutError } from './errors';
import type { OutgoingPayload } from './types';

export class WorkerResponseHandler {
	private id = -1;
	private handler: ReferredPromise<OutgoingPayload> | null = null;
	private timer: NodeJS.Timeout | null = null;

	public timeout(delay: number | null) {
		if (delay === null) {
			this.clearTimeout();
			return true;
		}

		const { handler } = this;
		if (handler === null) {
			return false;
		}

		this.timer = TimerManager.setTimeout(() => handler.reject(new TimeoutError()), delay);
		return true;
	}

	public define(id: number) {
		this.id = id;
		this.handler = createReferPromise();

		return this.handler.promise;
	}

	public resolve(id: number, data: OutgoingPayload) {
		if (this.id === id) {
			this.handler!.resolve(data);
			this.id = -1;
			this.handler = null;
			this.clearTimeout();
		}
	}

	public reject(id: number, error: Error) {
		if (this.id === id) {
			this.handler!.reject(error);
			this.id = -1;
			this.handler = null;
			this.clearTimeout();
		}
	}

	private clearTimeout() {
		if (this.timer) {
			TimerManager.clearTimeout(this.timer);
			this.timer = null;
		}
	}
}
