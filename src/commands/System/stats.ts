import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { MessageEmbed, version } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { cpus, uptime } from 'os';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['stats', 'sts'],
			bucket: 2,
			cooldown: 15,
			description: LanguageKeys.Commands.System.StatsDescription,
			extendedHelp: LanguageKeys.Commands.System.StatsExtended,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		return message.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: KlasaMessage) {
		const language = await message.fetchLanguage();
		const titles = language.get(LanguageKeys.Commands.System.StatsTitles);
		const fields = language.get(LanguageKeys.Commands.System.StatsFields, {
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
			channels: this.client.channels.cache.size.toLocaleString(),
			guilds: this.client.guilds.cache.size.toLocaleString(),
			nodeJs: process.version,
			users: this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
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
