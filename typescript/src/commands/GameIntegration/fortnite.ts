import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Fortnite } from '#lib/types/definitions/Fortnite';
import { safeWrapPromise } from '#utils/common';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Args, IArgument } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const VALID_PLATFORMS: PlatformUnion[] = ['xbox', 'psn', 'pc'];

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('FORTNITE_TOKEN'),
	cooldown: 10,
	description: LanguageKeys.Commands.GameIntegration.FortniteDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.FortniteExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	private apiBaseUrl = 'https://api.fortnitetracker.com/v1/profile/';

	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const platform = await args.pick(UserPaginatedMessageCommand.platformResolver).catch(() => 'pc' as const);
		const user = await args.rest('string');
		const response = await sendLoadingMessage(message, args.t);

		const fortniteUser = await this.fetchAPI(user, platform);
		const display = await this.buildDisplay(message, args.t, fortniteUser);

		await display.run(response, message.author);
		return response;
	}

	private async fetchAPI(user: string, platform: PlatformUnion) {
		const result = await safeWrapPromise(
			fetch<Fortnite.FortniteUser>(
				`${this.apiBaseUrl}/${platform}/${user}`,
				{ headers: { 'TRN-Api-Key': process.env.FORTNITE_TOKEN } },
				FetchResultTypes.JSON
			)
		);
		if (!result.success) this.error(LanguageKeys.Commands.GameIntegration.FortniteNoUser);
		if (result.value.error) {
			this.context.logger.fatal(`Fortnite[${platform}/${user}]: ${result.value.error}`);
			this.error(LanguageKeys.Commands.GameIntegration.FortniteNoUser);
		}

		return result.value;
	}

	private async buildDisplay(
		message: GuildMessage,
		t: TFunction,
		{ lifeTimeStats, epicUserHandle, platformName, stats: { p2, p10, p9 } }: Fortnite.FortniteUser
	) {
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.GameIntegration.FortniteEmbedTitle, { epicUserHandle }))
				.setURL(encodeURI(`https://fortnitetracker.com/profile/${platformName}/${epicUserHandle}`))
				.setColor(await this.context.db.fetchColor(message))
		});
		const embedSectionTitles = t(LanguageKeys.Commands.GameIntegration.FortniteEmbedSectionTitles);

		display.addPageEmbed((embed) => {
			const lts = lifeTimeStats.map((stat) => ({ ...stat, key: stat.key.toLowerCase() }));
			const ltsData = t(LanguageKeys.Commands.GameIntegration.FortniteEmbedStats, {
				winCount: lts.find((el) => el.key === 'wins')!.value,
				killCount: lts.find((el) => el.key === 'kills')!.value,
				kdrCount: lts.find((el) => el.key === 'k/d')!.value,
				matchesPlayedCount: lts.find((el) => el.key === 'matches played')!.value,
				top1Count: '',
				top3Count: lts.find((el) => el.key === 'top 3s')!.value,
				top5Count: lts.find((el) => el.key === 'top 5s')!.value,
				top6Count: lts.find((el) => el.key === 'top 6s')!.value,
				top10Count: lts.find((el) => el.key === 'top 10')!.value,
				top12Count: lts.find((el) => el.key === 'top 12s')!.value,
				top25Count: lts.find((el) => el.key === 'top 25s')!.value
			});
			return embed.setDescription(
				[
					embedSectionTitles.lifetimeStats,
					ltsData.wins,
					ltsData.kills,
					ltsData.kdr,
					ltsData.matchesPlayed,
					ltsData.top3s,
					ltsData.top5s,
					ltsData.top6s,
					ltsData.top10s,
					ltsData.top12s,
					ltsData.top25s
				].join('\n')
			);
		});

		if (p2) {
			display.addPageEmbed((embed) => {
				const p2Data = t(LanguageKeys.Commands.GameIntegration.FortniteEmbedStats, {
					winCount: p2.top1.value,
					killCount: p2.kills.value,
					kdrCount: p2.kd.value,
					matchesPlayedCount: p2.matches.value,
					top1Count: p2.top1.value,
					top3Count: p2.top3.value,
					top5Count: p2.top5.value,
					top6Count: p2.top6.value,
					top10Count: p2.top10.value,
					top12Count: p2.top12.value,
					top25Count: p2.top25.value
				});
				return embed.setDescription(
					[
						embedSectionTitles.solos,
						p2Data.wins,
						p2Data.kills,
						p2Data.kdr,
						p2Data.matchesPlayed,
						p2Data.top1s,
						p2Data.top3s,
						p2Data.top5s,
						p2Data.top6s,
						p2Data.top10s,
						p2Data.top12s,
						p2Data.top25s
					].join('\n')
				);
			});
		}

		if (p10) {
			display.addPageEmbed((embed) => {
				const p10Data = t(LanguageKeys.Commands.GameIntegration.FortniteEmbedStats, {
					winCount: p10.top1.value,
					killCount: p10.kills.value,
					kdrCount: p10.kd.value,
					matchesPlayedCount: p10.matches.value,
					top1Count: p10.top1.value,
					top3Count: p10.top3.value,
					top5Count: p10.top5.value,
					top6Count: p10.top6.value,
					top10Count: p10.top10.value,
					top12Count: p10.top12.value,
					top25Count: p10.top25.value
				});
				return embed.setDescription(
					[
						embedSectionTitles.duos,
						p10Data.wins,
						p10Data.kills,
						p10Data.kdr,
						p10Data.matchesPlayed,
						p10Data.top1s,
						p10Data.top3s,
						p10Data.top5s,
						p10Data.top6s,
						p10Data.top10s,
						p10Data.top12s,
						p10Data.top25s
					].join('\n')
				);
			});
		}

		if (p9) {
			display.addPageEmbed((embed) => {
				const p9Data = t(LanguageKeys.Commands.GameIntegration.FortniteEmbedStats, {
					winCount: p9.top1.value,
					killCount: p9.kills.value,
					kdrCount: p9.kd.value,
					matchesPlayedCount: p9.matches.value,
					top1Count: p9.top1.value,
					top3Count: p9.top3.value,
					top5Count: p9.top5.value,
					top6Count: p9.top6.value,
					top10Count: p9.top10.value,
					top12Count: p9.top12.value,
					top25Count: p9.top25.value
				});
				return embed.setDescription(
					[
						embedSectionTitles.squads,
						p9Data.wins,
						p9Data.kills,
						p9Data.kdr,
						p9Data.matchesPlayed,
						p9Data.top1s,
						p9Data.top3s,
						p9Data.top5s,
						p9Data.top6s,
						p9Data.top10s,
						p9Data.top12s,
						p9Data.top25s
					].join('\n')
				);
			});
		}

		return display;
	}

	private static platformResolver: IArgument<PlatformUnion> = Args.make((parameter, { argument }) => {
		if (VALID_PLATFORMS.includes(parameter.toLowerCase() as PlatformUnion)) return Args.ok(parameter.toLowerCase() as PlatformUnion);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.GameIntegration.FortniteInvalidPlatform });
	});
}

type PlatformUnion = 'xbox' | 'psn' | 'pc';
