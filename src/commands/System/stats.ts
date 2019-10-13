import { version } from 'discord.js';
import { CommandStore, Duration, KlasaMessage } from 'klasa';
import { loadavg, uptime } from 'os';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['stats', 'sts'],
			bucket: 2,
			cooldown: 15,
			description: language => language.get('COMMAND_STATS_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_STATS_EXTENDED')
		});
	}

	public async run(message: KlasaMessage) {
		return message.sendLocale('COMMAND_STATS', [this.STATS, this.UPTIME, this.USAGE], { code: 'asciidoc' });
	}

	public get STATS(): StatsGeneral {
		return {
			CHANNELS: this.client.channels.size.toLocaleString(),
			GUILDS: this.client.guilds.size.toLocaleString(),
			NODE_JS: process.version,
			USERS: this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
			VERSION: `v${version}`
		};
	}

	public get UPTIME(): StatsUptime {
		const now = Date.now();
		return {
			CLIENT: Duration.toNow(now - this.client.uptime!, false),
			HOST: Duration.toNow(now - (uptime() * 1000), false),
			TOTAL: Duration.toNow(now - (process.uptime() * 1000), false)
		};
	}

	public get USAGE(): StatsUsage {
		return {
			CPU_LOAD: `${Math.round(loadavg()[0] * 100) / 100}%`,
			RAM_TOTAL: `${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		};
	}

}

export interface StatsGeneral {
	CHANNELS: string;
	GUILDS: string;
	NODE_JS: string;
	USERS: string;
	VERSION: string;
}

export interface StatsUptime {
	CLIENT: string;
	HOST: string;
	TOTAL: string;
}

export interface StatsUsage {
	CPU_LOAD: string;
	RAM_TOTAL: string;
	RAM_USED: string;
}
