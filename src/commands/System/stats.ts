import { cpus, uptime } from 'os';

import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { roundNumber } from '@sapphire/utilities';
import { MessageEmbed, version } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['stats', 'sts'],
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get('commandStatsDescription'),
			extendedHelp: (language) => language.get('commandStatsExtended'),
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		return message.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: KlasaMessage) {
		const titles = message.language.get('commandStatsTitles');
		const fields = message.language.get('commandStatsFields', {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics
		});
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.addField(titles.stats, fields.stats)
			.addField(titles.uptime, fields.uptime)
			.addField(titles.serverUsage, fields.serverUsage);
	}

	private get generalStatistics(): StatsGeneral {
		return {
			channels: this.client.channels.size.toLocaleString(),
			guilds: this.client.guilds.size.toLocaleString(),
			nodeJs: process.version,
			users: this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
			version: `v${version}`
		};
	}

	private get uptimeStatistics(): StatsUptime {
		return {
			client: this.client.uptime!,
			host: uptime() * 1000,
			total: process.uptime() * 1000
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			cpuLoad: cpus().map(({ times }) => roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100),
			ramTotal: `${Math.round(100 * (usage.heapTotal / 1048576)) / 100}MB`,
			ramUsed: `${Math.round(100 * (usage.heapUsed / 1048576)) / 100}MB`
		};
	}
}

export interface StatsGeneral {
	channels: string;
	guilds: string;
	nodeJs: string;
	users: string;
	version: string;
}

export interface StatsUptime {
	client: number;
	host: number;
	total: number;
}

export interface StatsUsage {
	cpuLoad: number[];
	ramTotal: string;
	ramUsed: string;
}
