import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { TOKENS } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { Fortnite } from '@utils/GameIntegration/Fortnite';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get('COMMAND_FORTNITE_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_FORTNITE_EXTENDED'),
	usage: '<xbox|psn|pc:default> <user:...string>',
	usageDelim: ' '
})
export default class extends RichDisplayCommand {
	private apiBaseUrl = 'https://api.fortnitetracker.com/v1/profile/';

	public async run(message: KlasaMessage, [platform, user]: [platform, string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);

		const fortniteUser = await this.fetchAPI(message, user, platform);
		const display = await this.buildDisplay(message, fortniteUser);

		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, user: string, platform: platform) {
		try {
			const fortniteUser = await fetch<Fortnite.FortniteUser>(
				`${this.apiBaseUrl}/${platform}/${user}`,
				{ headers: { 'TRN-Api-Key': TOKENS.FORTNITE_KEY } },
				FetchResultTypes.JSON
			);

			if (fortniteUser.error) throw 'err'; // This gets handled in the catch, no reason to get the proper error message here.
			return fortniteUser;
		} catch {
			// Either when no user is found (response will have an error message)
			// Or there was a server fault (no json will be returned)
			throw message.language.get('COMMAND_FORTNITE_NO_USER');
		}
	}

	private async buildDisplay(
		message: KlasaMessage,
		{ lifeTimeStats, epicUserHandle, platformName, stats: { p2, p10, p9 } }: Fortnite.FortniteUser
	) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(message.language.get('COMMAND_FORTNITE_EMBED_TITLE', { epicUserHandle }))
				.setURL(encodeURI(`https://fortnitetracker.com/profile/${platformName}/${epicUserHandle}`))
				.setColor(await DbSet.fetchColor(message))
		);
		const embedSectionTitles = message.language.get('COMMAND_FORTNITE_EMBED_SECTION_TITLES');

		display
			.addPage((embed) => {
				const lts = lifeTimeStats.map((stat) => ({ ...stat, key: stat.key.toLowerCase() }));
				const ltsData = message.language.get('COMMAND_FORTNITE_EMBED_STATS', {
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
						embedSectionTitles.LIFETIME_STATS,
						ltsData.WINS,
						ltsData.KILLS,
						ltsData.KDR,
						ltsData.MATCHES_PLAYED,
						ltsData.TOP_3S,
						ltsData.TOP_5S,
						ltsData.TOP_6S,
						ltsData.TOP_10S,
						ltsData.TOP_12S,
						ltsData.TOP_25S
					].join('\n')
				);
			})
			.addPage((embed) => {
				const p2Data = message.language.get('COMMAND_FORTNITE_EMBED_STATS', {
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
						embedSectionTitles.SOLOS,
						p2Data.WINS,
						p2Data.KILLS,
						p2Data.KDR,
						p2Data.MATCHES_PLAYED,
						p2Data.TOP_1S,
						p2Data.TOP_3S,
						p2Data.TOP_5S,
						p2Data.TOP_6S,
						p2Data.TOP_10S,
						p2Data.TOP_12S,
						p2Data.TOP_25S
					].join('\n')
				);
			});

		if (p10) {
			display.addPage((embed) => {
				const p10Data = message.language.get('COMMAND_FORTNITE_EMBED_STATS', {
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
						embedSectionTitles.DUOS,
						p10Data.WINS,
						p10Data.KILLS,
						p10Data.KDR,
						p10Data.MATCHES_PLAYED,
						p10Data.TOP_1S,
						p10Data.TOP_3S,
						p10Data.TOP_5S,
						p10Data.TOP_6S,
						p10Data.TOP_10S,
						p10Data.TOP_12S,
						p10Data.TOP_25S
					].join('\n')
				);
			});
		}

		if (p9) {
			display.addPage((embed) => {
				const p9Data = message.language.get('COMMAND_FORTNITE_EMBED_STATS', {
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
						embedSectionTitles.SQUADS,
						p9Data.WINS,
						p9Data.KILLS,
						p9Data.KDR,
						p9Data.MATCHES_PLAYED,
						p9Data.TOP_1S,
						p9Data.TOP_3S,
						p9Data.TOP_5S,
						p9Data.TOP_6S,
						p9Data.TOP_10S,
						p9Data.TOP_12S,
						p9Data.TOP_25S
					].join('\n')
				);
			});
		}

		return display;
	}
}

type platform = 'xbox' | 'psn' | 'pc';
