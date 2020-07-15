import { Events, Schedules } from '@lib/types/Enums';
import { ENABLE_INFLUX, ENABLE_LAVALINK } from '@root/config';
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
				this.connectLavalink(),
				this.initAnalytics()
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
		const { queue } = this.client.schedules;
		if (!queue.some(task => task.taskID === Schedules.Poststats)) {
			await this.client.schedules.add(Schedules.Poststats, '*/10 * * * *', {});
		}
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	private async initCleanupTask() {
		const { queue } = this.client.schedules;
		if (!queue.some(task => task.taskID === Schedules.Cleanup)) {
			await this.client.schedules.add(Schedules.Cleanup, '*/10 * * * *', {});
		}
	}

	private async initTwitchRefreshSubscriptionsTask() {
		const { queue } = this.client.schedules;
		if (!queue.some(task => task.taskID === Schedules.TwitchRefreshSubscriptions)) {
			await this.client.schedules.add(Schedules.TwitchRefreshSubscriptions, '@daily');
		}
	}

	private async initAnalytics() {
		if (ENABLE_INFLUX) {
			await this.client.emit(Events.AnalyticsSync,
				this.client.guilds.size,
				this.client.guilds.reduce((acc, val) => acc + val.memberCount, 0));
		}
	}

	private async connectLavalink() {
		if (ENABLE_LAVALINK) {
			await this.client.lavalink.connect();
		}
	}

}
