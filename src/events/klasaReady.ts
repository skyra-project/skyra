import { Slotmachine } from '#lib/games/Slotmachine';
import { WheelOfFortune } from '#lib/games/WheelOfFortune';
import { Events, Schedules } from '#lib/types/Enums';
import { DEV, ENABLE_INFLUX, ENABLE_LAVALINK, VERSION } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, red, white, yellow } from 'colorette';

const style = DEV ? yellow : blue;

@ApplyOptions<EventOptions>({ once: true })
export default class extends Event {
	public async run() {
		const { client } = this.context;
		try {
			await Promise.all([
				// Initialize Slotmachine data
				Slotmachine.init().catch((error) => client.logger.fatal(error)),
				// Initialize WheelOfFortune data
				WheelOfFortune.init().catch((error) => client.logger.fatal(error)),
				// Initialize giveaways
				client.giveaways.init().catch((error) => client.logger.fatal(error)),
				// Connect Lavalink if configured to do so
				this.connectLavalink(),
				this.initAnalytics()
			]);

			// Setup the stat updating task
			await this.initPostStatsTask().catch((error) => client.logger.fatal(error));
			// Setup the Twitch subscriptions refresh task
			await this.initTwitchRefreshSubscriptionsTask().catch((error) => client.logger.fatal(error));
		} catch (error) {
			client.logger.fatal(error);
		}

		this.printBanner();
		this.printStoreDebugInformation();
	}

	private async initPostStatsTask() {
		const { queue } = this.context.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.Poststats)) {
			await this.context.client.schedules.add(Schedules.Poststats, '*/10 * * * *', {});
		}
	}

	private async initTwitchRefreshSubscriptionsTask() {
		const { queue } = this.context.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.TwitchRefreshSubscriptions)) {
			await this.context.client.schedules.add(Schedules.TwitchRefreshSubscriptions, '@daily');
		}
	}

	private async initSyncResourceAnalyticsTask() {
		const { queue } = this.context.client.schedules;
		if (!queue.some((task) => task.taskID === Schedules.SyncResourceAnalytics)) {
			await this.context.client.schedules.add(Schedules.SyncResourceAnalytics, '*/1 * * * *');
		}
	}

	private async initAnalytics() {
		if (ENABLE_INFLUX) {
			const { client } = this.context;
			client.emit(
				Events.AnalyticsSync,
				client.guilds.cache.size,
				client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0)
			);

			await this.initSyncResourceAnalyticsTask().catch((error) => client.logger.fatal(error));
		}
	}

	private async connectLavalink() {
		if (ENABLE_LAVALINK) {
			await this.context.client.audio.connect();
			await this.context.client.audio.queues!.start();
		}
	}

	private printBanner() {
		const { client } = this.context;
		const success = green('+');
		const failed = red('-');
		const llc = DEV ? magentaBright : white;
		const blc = DEV ? magenta : blue;

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
${line10} [${client.analytics ? success : failed}] Analytics
${line11} [${client.audio.queues?.client.connected ? success : failed}] Audio
${line12} [${success}] Moderation
${line13} [${success}] Social & Leaderboards
${line14}${DEV ? ` ${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { logger } = this.context.client;
		const stores = [...this.context.client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.debug(this.styleStore(store, false));
		logger.debug(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(` ${last ? '└─' : '├─'} Loaded ${style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
