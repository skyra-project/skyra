import { Event, EventStore } from 'klasa';
import { Events } from '@lib/types/Enums';
import { Slotmachine } from '@util/Games/Slotmachine';
import { WheelOfFortune } from '@util/Games/WheelOfFortune';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	public async run() {
		try {
			await Promise.all([
				Slotmachine.init().catch(error => this.client.emit(Events.Wtf, error)),
				WheelOfFortune.init().catch(error => this.client.emit(Events.Wtf, error)),
				this.client.giveaways.init().catch(error => this.client.emit(Events.Wtf, error))
			]);
			await this.initCleanupTask().catch(error => this.client.emit(Events.Wtf, error));
			await this.initPostStatsTask().catch(error => this.client.emit(Events.Wtf, error));
		} catch (error) {
			this.client.console.wtf(error);
		}
	}

	private async initPostStatsTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'poststats')) {
			await this.client.schedule.create('poststats', '*/15 * * * *', {});
		}
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	private async initCleanupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'cleanup')) {
			await this.client.schedule.create('cleanup', '*/10 * * * *', {});
		}
	}

}
