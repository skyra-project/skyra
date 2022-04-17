import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { StatsGeneral, StatsUptime, StatsUsage } from '#lib/i18n/languageKeys/keys/commands/General';
import { SkyraCommand } from '#lib/structures';
import { seconds } from '#utils/common';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { version as sapphireVersion } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { roundNumber } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { Message, MessageEmbed, version as djsVersion } from 'discord.js';
import { cpus, uptime, type CpuInfo } from 'os';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bot-info', 'stats', 'sts'],
	description: LanguageKeys.Commands.General.InfoDescription,
	detailedDescription: LanguageKeys.Commands.General.InfoExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = await this.buildEmbed(message, args);
		return send(message, { embeds: [embed] });
	}

	private async buildEmbed(message: Message, args: SkyraCommand.Args) {
		const titles = args.t(LanguageKeys.Commands.General.InfoTitles);
		const fields = args.t(LanguageKeys.Commands.General.InfoFields, {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics
		});

		return new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setAuthor({
				name: this.container.client.user!.tag,
				iconURL: this.container.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			})
			.setDescription(args.t(LanguageKeys.Commands.General.InfoBody))
			.setTimestamp()
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
			djsVersion: `v${djsVersion}`,
			sapphireVersion: `v${sapphireVersion}`
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
