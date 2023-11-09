import { Events, Schedules } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Piece, Store } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { envParseBoolean } from '@skyra/env-utilities';
import { blue, gray, green, magenta, magentaBright, red, white, yellow } from 'colorette';

@ApplyOptions<Listener.Options>({ once: true })
export class UserListener extends Listener {
	private readonly style = this.container.client.dev ? yellow : blue;

	public async run() {
		try {
			await this.initAnalytics();

			// Setup the stat updating task
			await this.initPostStatsTask().catch((error) => this.container.logger.fatal(error));
			// Setup the Twitch subscriptions refresh task
		} catch (error) {
			this.container.logger.fatal(error);
		}

		this.printBanner();
		this.printStoreDebugInformation();
	}

	private async initPostStatsTask() {
		const { queue } = this.container.schedule;
		if (!queue.some((task) => task.taskId === Schedules.Poststats)) {
			await this.container.schedule.add(Schedules.Poststats, '*/10 * * * *', {});
		}
	}

	private async initSyncResourceAnalyticsTask() {
		const { queue } = this.container.schedule;
		if (!queue.some((task) => task.taskId === Schedules.SyncResourceAnalytics)) {
			await this.container.schedule.add(Schedules.SyncResourceAnalytics, '*/1 * * * *');
		}
	}

	private async initAnalytics() {
		if (envParseBoolean('INFLUX_ENABLED')) {
			const { client } = this.container;
			client.emit(
				Events.AnalyticsSync,
				client.guilds.cache.size,
				client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0)
			);

			await this.initSyncResourceAnalyticsTask().catch((error) => this.container.logger.fatal(error));
		}
	}

	private printBanner() {
		const { client } = this.container;
		const success = green('+');
		const failed = red('-');
		const llc = client.dev ? magentaBright : white;
		const blc = client.dev ? magenta : blue;

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
		const line15 = llc(String.raw`                     `);

		// Offset Pad
		const pad = ' '.repeat(7);

		const isAuthEnabled = !isNullish(client.options.api?.auth);

		console.log(
			String.raw`
${line01}   ________  __   ___  ___  ___  _______        __
${line02}  /"       )|/"| /  ")|"  \/"  |/"      \      /""\
${line03} (:   \___/ (: |/   /  \   \  /|:        |    /    \
${line04}  \___  \   |    __/    \\  \/ |_____/   )   /' /\  \
${line05}   __/  \\  (// _  \    /   /   //      /   //  __'  \
${line06}  /" \   :) |: | \  \  /   /   |:  __   \  /   /  \\  \
${line07} (_______/  (__|  \__)|___/    |__|  \___)(___/    \___)
${line08} ${blc(process.env.CLIENT_VERSION.padStart(55, ' '))}
${line09} ${pad}[${success}] Gateway
${line10} ${pad}[${client.analytics ? success : failed}] Analytics
${line11} ${pad}[${isAuthEnabled ? success : failed}] OAuth 2.0 Enabled
${line12} ${pad}[${success}] Moderation
${line13}
${line14}
${line15}${client.dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger, i18n } = this.container;
		const stores = [...client.stores.values()];

		for (const store of stores) {
			logger.info(this.styleStore(store));
		}

		logger.info(this.styleLanguages(i18n.languages));
	}

	private styleStore(store: Store<Piece>) {
		return gray(`├─ Loaded ${this.style(store.size.toString().padEnd(2, ' '))} ${store.name}.`);
	}

	private styleLanguages(languages: Map<string, TFunction>) {
		return gray(`└─ Loaded ${this.style(languages.size.toString().padEnd(2, ' '))} languages.`);
	}
}
