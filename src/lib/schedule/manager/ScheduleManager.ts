import { ResponseType, ScheduleEntry, type ResponseValue } from '#lib/schedule/manager/ScheduleEntry';
import { container } from '@sapphire/framework';
import { Cron } from '@sapphire/time-utilities';

export class ScheduleManager {
	public queue: ScheduleEntry[] = [];
	private interval: NodeJS.Timeout | null = null;

	public destroy() {
		this._clearInterval();
	}

	public async init() {
		const entries = await container.prisma.schedule.findMany();
		for (const entry of entries) this._insert(new ScheduleEntry(entry));
		this._checkInterval();
	}

	public async add<const Type extends ScheduleEntry.TaskId>(
		taskId: Type,
		timeResolvable: TimeResolvable,
		options: ScheduleManagerAddOptions<Type>
	) {
		if (!container.stores.get('tasks').has(taskId)) throw new Error(`The task '${taskId}' does not exist.`);

		const [time, cron] = this._resolveTime(timeResolvable);
		const entry = await ScheduleEntry.create({
			taskId,
			time,
			recurring: cron ? cron.cron : null,
			catchUp: options.catchUp ?? true,
			data: options.data
		});

		this._insert(entry);
		this._checkInterval();
		return entry;
	}

	public async reschedule(entityOrId: ScheduleEntry | number, time: Date | number) {
		if (typeof entityOrId === 'number') {
			entityOrId = this.queue.find((entry) => entry.id === entityOrId)!;
			if (!entityOrId) return false;
		}

		try {
			entityOrId.pause();

			await entityOrId.update({ time: new Date(time) });
			this._remove(entityOrId);
			this._insert(entityOrId);
		} finally {
			entityOrId.resume();
		}

		return true;
	}

	public async remove(entityOrId: ScheduleEntry | number) {
		if (typeof entityOrId === 'number') {
			entityOrId = this.queue.find((entity) => entity.id === entityOrId)!;
			if (!entityOrId) return false;
		}

		entityOrId.pause();
		await container.prisma.schedule.delete({ where: { id: entityOrId.id } });

		this._remove(entityOrId);
		this._checkInterval();
		return true;
	}

	public async execute() {
		if (this.queue.length) {
			// Process the active tasks, they're sorted by the time they end
			const now = Date.now();
			const execute: Promise<ResponseValue>[] = [];
			for (const entry of this.queue) {
				if (entry.time.getTime() > now) break;
				execute.push(entry.run());
			}

			// Check if the Schedule has a task to run and run them if they exist
			if (!execute.length) return;
			await this._handleResponses(await Promise.all(execute));
		}

		this._checkInterval();
	}

	private _insert(entity: ScheduleEntry) {
		const index = this.queue.findIndex((entry) => entry.time > entity.time);
		if (index === -1) this.queue.push(entity);
		else this.queue.splice(index, 0, entity);

		return entity;
	}

	private _remove(entity: ScheduleEntry) {
		const index = this.queue.indexOf(entity);
		if (index !== -1) this.queue.splice(index, 1);
	}

	private async _handleResponses(responses: readonly ResponseValue[]) {
		const results = await Promise.allSettled(responses.map((response) => this._handleResponse(response)));
		for (const result of results) {
			if (result.status === 'rejected') container.logger.error(result.reason);
		}
	}

	private async _handleResponse(response: ResponseValue) {
		// 1. If the response is to ignore, do nothing, the entry will be re-run.
		if (response.type === ResponseType.Ignore) {
			return;
		}

		response.entry.pause();

		// 2. If the response is to finish, remove the entry from the database and the cache.
		if (response.type === ResponseType.Finished) {
			await container.prisma.schedule.delete({ where: { id: response.entry.id } });
			this._remove(response.entry);
			return;
		}

		// 3. If the response is to update the time, update the time in the database and the cache.
		let time: Date;
		if (response.type === ResponseType.Delay) {
			time = new Date(response.entry.time.getTime() + response.value);
		} else if (response.type === ResponseType.Update) {
			time = response.value;
		} else {
			throw new Error('Unreachable');
		}

		await response.entry.update({ time });

		const index = this.queue.findIndex((entity) => entity === response.entry);
		if (index === -1) return;

		this.queue.splice(index, 1);
		this._insert(response.entry);

		// Resume so it can be run again
		response.entry.resume();
	}

	/**
	 * Clear the current interval
	 */
	private _clearInterval(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	/**
	 * Sets the interval when needed
	 */
	private _checkInterval(): void {
		if (!this.queue.length) {
			this._clearInterval();
		} else if (!this.interval) {
			this.interval = setInterval(this.execute.bind(this), container.client.options.schedule?.interval ?? 5000).unref();
		}
	}

	/**
	 * Resolve the time and cron
	 * @param time The time or Cron pattern
	 */
	private _resolveTime(time: TimeResolvable): [Date, Cron | null] {
		if (time instanceof Date) return [time, null];
		if (time instanceof Cron) return [time.next(), time];
		if (typeof time === 'number') return [new Date(time), null];
		if (typeof time === 'string') {
			const cron = new Cron(time);
			return [cron.next(), cron];
		}
		throw new Error('invalid time passed');
	}
}

export interface ScheduleManagerAddOptions<Type extends ScheduleEntry.TaskId> {
	/**
	 * If the task should try to catch up if the bot is down.
	 */
	catchUp?: boolean;

	/**
	 * The data to pass to the Task piece when the ScheduledTask is ready for execution.
	 */
	data: ScheduleEntry.TaskData[Type];
}

export type TimeResolvable = number | Date | string | Cron;
