import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { seconds } from '#utils/common';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { roundNumber } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed, version } from 'discord.js';
import { CpuInfo, cpus, uptime } from 'node:os';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['stats', 'sts'],
	description: LanguageKeys.Commands.System.StatsDescription,
	detailedDescription: LanguageKeys.Commands.System.StatsExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = await this.buildEmbed(message, args);
		return send(message, { embeds: [embed] });
	}

	private async buildEmbed(message: Message, args: SkyraCommand.Args) {
		const titles = args.t(LanguageKeys.Commands.System.StatsTitles);
		const fields = args.t(LanguageKeys.Commands.System.StatsFields, {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics
		});

		return new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.addField(titles.stats, fields.stats)
			.addField(titles.uptime, fields.uptime)
			.addField(titles.serverUsage, fields.serverUsage);
	}

	private get generalStatistics(): StatsGeneral {
		const { client } = this.container;
		return {
			channels: client.channels.cache.size,
			guilds: client.guilds.cache.size,
			nodeJs: process.version,
			users: client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0),
			version: `v${version}`
		};
	}

	private get uptimeStatistics(): StatsUptime {
		const now = Date.now();
		const nowSeconds = roundNumber(now / 1000);
		return {
			client: time(seconds.fromMilliseconds(now - this.container.client.uptime!), TimestampStyles.RelativeTime),
			host: time(roundNumber(nowSeconds - uptime()), TimestampStyles.RelativeTime),
			total: time(roundNumber(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
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
	client: string;
	host: string;
	total: string;
}

export interface StatsUsage {
	cpuLoad: string;
	ramTotal: number;
	ramUsed: number;
}
