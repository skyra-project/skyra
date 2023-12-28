import { createReferPromise, type ReferredPromise } from '#utils/common';
import { TimeoutError } from '#lib/moderation/workers/errors/TimeoutError';
import type { OutgoingPayload } from '#lib/moderation/workers/types';

export class WorkerResponseHandler {
	private id = -1;
	private handler: ReferredPromise<OutgoingPayload> | null = null;
	private timer: NodeJS.Timeout | null = null;

	public destroy() {
		this.clearTimeout();
	}

	public timeout(delay: number | null) {
		if (delay === null) {
			return this.clearTimeout();
		}

		const { id } = this;
		if (id === -1) {
			return false;
		}

		this.clearTimeout();
		this.timer = setTimeout(() => this.reject(id, new TimeoutError()), delay).unref();
		return true;
	}

	public define(id: number) {
		this.id = id;
		this.handler = createReferPromise();

		return this.handler.promise;
	}

	public resolve(id: number, data: OutgoingPayload) {
		if (this.id === id) {
			this.id = -1;
			this.clearTimeout();
			this.handler!.resolve(data);
			this.handler = null;
		}
	}

	public reject(id: number, error: Error) {
		if (this.id === id) {
			this.id = -1;
			this.clearTimeout();
			this.handler!.reject(error);
			this.handler = null;
		}
	}

	private clearTimeout() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;

			return true;
		}

		return false;
	}
}
