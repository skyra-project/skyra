import { Events, Schedules } from '@lib/types/Enums';
import { ENABLE_INFLUX, ENABLE_LAVALINK } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Slotmachine } from '@utils/Games/Slotmachine';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ once: true })
export default class extends Event {
	public async run() {
		try {
			await Promise.all([
				// Initialize Slotmachine data
				Slotmachine.init().catch((error) => this.client.emit(Events.Wtf, error)),
				// Initialize WheelOfFortune data
				WheelOfFortune.init().catch((error) => this.client.emit(Events.Wtf, error)),
				// Initialize giveaways
				this.client.giveaways.init().catch((error) => this.client.emit(Events.Wtf, error)),
				// Update guild permission managers
				this.client.guilds.cache.map((guild) => guild.permissionsManager.update()),
				// Connect Lavalink if configured to do so
				this.connectLavalink(),
				this.initAnalytics()
			]);

			// Setup the stat updating task
			await this.initPostStatsTask().catch((error) => this.client.emit(Events.Wtf, error));
			// Setup the Twitch subscriptions refresh task
			await this.initTwitchRefreshSubscriptionsTask().catch((error) => this.client.emit(Events.Wtf, error));
		} catch (error) {
			this.client.console.wtf(error);
		}
	}

	private async initPostStatsTask() {
		const { queue } = this.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.Poststats)) {
			await this.client.schedules.add(Schedules.Poststats, '*/10 * * * *', {});
		}
	}

	private async initTwitchRefreshSubscriptionsTask() {
		const { queue } = this.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.TwitchRefreshSubscriptions)) {
			await this.client.schedules.add(Schedules.TwitchRefreshSubscriptions, '@daily');
		}
	}

	private async initSyncResourceAnalyticsTask() {
		const { queue } = this.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.SyncResourceAnalytics)) {
			await this.client.schedules.add(Schedules.SyncResourceAnalytics, '*/1 * * * *');
		}
	}

	private async initAnalytics() {
		if (ENABLE_INFLUX) {
			this.client.emit(
				Events.AnalyticsSync,
				this.client.guilds.cache.size,
				this.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
			);

			await this.initSyncResourceAnalyticsTask().catch((error) => this.client.emit(Events.Wtf, error));
		}
	}

	private async connectLavalink() {
		if (ENABLE_LAVALINK) {
			await this.client.audio.connect();
			await this.client.audio.queues!.start();
		}
	}
}
