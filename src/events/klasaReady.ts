import { Events } from '@lib/types/Enums';
import { ENABLE_LAVALINK } from '@root/config';
import { Slotmachine } from '@utils/Games/Slotmachine';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	public async run() {
		try {
			await Promise.all([
				// Initialize Slotmachine data
				Slotmachine.init().catch(error => this.client.emit(Events.Wtf, error)),
				// Initialize WheelOfFortune data
				WheelOfFortune.init().catch(error => this.client.emit(Events.Wtf, error)),
				// Initialize giveaways
				this.client.giveaways.init().catch(error => this.client.emit(Events.Wtf, error)),
				// Update guild permission managers
				this.client.guilds.map(guild => guild.permissionsManager.update()),
				// Connect Lavalink if configured to do so
				this.connectLavalink()
			]);

			// Setup the cleanup task
			await this.initCleanupTask().catch(error => this.client.emit(Events.Wtf, error));
			// Setup the stat updating task
			await this.initPostStatsTask().catch(error => this.client.emit(Events.Wtf, error));
			// Setup the Twitch subscriptions refresh task
			await this.initTwitchRefreshSubscriptionsTask().catch(error => this.client.emit(Events.Wtf, error));
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

	private async initTwitchRefreshSubscriptionsTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'twitchRefreshSubscriptions')) {
			await this.client.schedule.create('twitchRefreshSubscriptions', '@daily');
		}
	}

	private async connectLavalink() {
		if (ENABLE_LAVALINK) {
			await this.client.lavalink.connect();
		}
	}

}
