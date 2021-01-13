import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed, version } from 'discord.js';
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
	public async run(message: Message) {
		return message.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: Message) {
		const t = await message.fetchT();
		const titles = t(LanguageKeys.Commands.System.StatsTitles);
		const fields = t(LanguageKeys.Commands.System.StatsFields, {
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
			channels: this.client.channels.cache.size,
			guilds: this.client.guilds.cache.size,
			nodeJs: process.version,
			users: this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0),
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
			ramTotal: usage.heapTotal / 1048576,
			ramUsed: usage.heapUsed / 1048576
		};
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}
}

export interface StatsGeneral {
	channels: number;
	guilds: number;
	nodeJs: string;
	users: number;
	version: string;
}

export interface StatsUptime {
	client: number;
	host: number;
	total: number;
}

export interface StatsUsage {
	cpuLoad: string;
	ramTotal: number;
	ramUsed: number;
}
