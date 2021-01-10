import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, version } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { CpuInfo, cpus, uptime } from 'os';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['stats', 'sts'],
	bucket: 2,
	cooldown: 15,
	description: LanguageKeys.Commands.System.StatsDescription,
	extendedHelp: LanguageKeys.Commands.System.StatsExtended,
	requiredPermissions: ['EMBED_LINKS']
})
export default class UserCommand extends SkyraCommand {
	public async run(message: KlasaMessage) {
		return message.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: KlasaMessage) {
		const t = await message.fetchT();
		const titles = t(LanguageKeys.Commands.System.StatsTitles, { returnObjects: true });
		const fields = t(LanguageKeys.Commands.System.StatsFields, {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics,
			returnObjects: true
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
			cpuLoad: cpus().map(UserCommand.formatCpuInfo.bind(null)).join(' | '),
			ramTotal: `${Math.round(100 * (usage.heapTotal / 1048576)) / 100}MB`,
			ramUsed: `${Math.round(100 * (usage.heapUsed / 1048576)) / 100}MB`
		};
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
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
	cpuLoad: string;
	ramTotal: string;
	ramUsed: string;
}
