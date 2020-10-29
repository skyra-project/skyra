import { Events, Schedules } from '@lib/types/Enums';
import { DEV, ENABLE_INFLUX, ENABLE_LAVALINK, VERSION } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Slotmachine } from '@utils/Games/Slotmachine';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { blue, green, magenta, magentaBright, red, white } from 'colorette';
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

		const success = green('+');
		const failed = red('-');
<<<<<<< HEAD
		const llc = DEV ? magentaBright : white;
		const blc = DEV ? magenta : blue;
=======
		const llc = !DEV ? magentaBright : white;
		const blc = !DEV ? magenta : blue;
>>>>>>> 6beefde4 (feat: added login banner)

		const line01 = llc(String.raw`          /          `);
		const line02 = llc(String.raw`       ${blc('/╬')}▓           `);
		const line03 = llc(String.raw`     ${blc('/▓▓')}╢            `);
		const line04 = llc(String.raw`   [${blc('▓▓')}▓╣/            `);
		const line05 = llc(String.raw`   [╢╢╣▓             `);
		const line06 = llc(String.raw`    %,╚╣╣@\          `);
		const line07 = llc(String.raw`      #,╙▓▓▓\╙N      `);
		const line08 = llc(String.raw`       '╙ \▓▓▓╖╙╦    `);
		const line09 = llc(String.raw`            \@╣▓╗╢%  `);
		const line10 = llc(String.raw`               ▓╣╢╢] `);
		const line11 = llc(String.raw`              /╣▓${blc('▓▓')}] `);
		const line12 = llc(String.raw`              ╢${blc('▓▓/')}   `);
		const line13 = llc(String.raw`             ▓${blc('╬/')}     `);
		const line14 = llc(String.raw`            /        `);

		console.log(
			String.raw`
${line01}   ________  __   ___  ___  ___  _______        __
${line02}  /"       )|/"| /  ")|"  \/"  |/"      \      /""\
${line03} (:   \___/ (: |/   /  \   \  /|:        |    /    \
${line04}  \___  \   |    __/    \\  \/ |_____/   )   /' /\  \
${line05}   __/  \\  (// _  \    /   /   //      /   //  __'  \
${line06}  /" \   :) |: | \  \  /   /   |:  __   \  /   /  \\  \
${line07} (_______/  (__|  \__)|___/    |__|  \___)(___/    \___)
${line08} ${blc(VERSION.padStart(55, ' '))}
${line09} [${success}] Gateway
${line10} [${this.client.analytics ? success : failed}] Analytics
${line11} [${this.client.audio.queues?.client.connected ? success : failed}] Audio
${line12}
${line13} ${DEV ? ' DEVELOPMENT MODE' : ''}
${line14}
		`.trim()
		);
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
