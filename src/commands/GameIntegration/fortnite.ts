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
		const TITLES = message.language.get('COMMAND_FORTNITE_TITLES');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(TITLES.TITLE({ epicUserHandle }))
				.setURL(encodeURI(`https://fortnitetracker.com/profile/${platformName}/${epicUserHandle}`))
				.setColor(await DbSet.fetchColor(message))
		);
		const lts = lifeTimeStats.map((stat) => ({ ...stat, key: stat.key.toLowerCase() }));

		display
			.addPage((embed: MessageEmbed) =>
				embed.setDescription(
					[
						TITLES.LIFETIME_STATS,
						TITLES.WINS({ count: lts.find((el) => el.key === 'wins')!.value }),
						TITLES.KILLS({ count: lts.find((el) => el.key === 'kills')!.value }),
						TITLES.KDR({ count: lts.find((el) => el.key === 'k/d')!.value }),
						TITLES.MATCHES_PLAYED({ count: lts.find((el) => el.key === 'matches played')!.value }),
						TITLES.TOP_3S({ count: lts.find((el) => el.key === 'top 3s')!.value }),
						TITLES.TOP_5S({ count: lts.find((el) => el.key === 'top 5s')!.value }),
						TITLES.TOP_6S({ count: lts.find((el) => el.key === 'top 6s')!.value }),
						TITLES.TOP_10S({ count: lts.find((el) => el.key === 'top 10')!.value }),
						TITLES.TOP_12S({ count: lts.find((el) => el.key === 'top 12s')!.value }),
						TITLES.TOP_25S({ count: lts.find((el) => el.key === 'top 25s')!.value })
					].join('\n')
				)
			)
			.addPage((embed: MessageEmbed) =>
				embed.setDescription(
					[
						TITLES.SOLOS,
						TITLES.WINS({ count: p2.top1.value }),
						TITLES.KILLS({ count: p2.kills.value }),
						TITLES.KDR({ count: p2.kd.value }),
						TITLES.MATCHES_PLAYED({ count: p2.matches.value }),
						TITLES.TOP_1S({ count: p2.top1.value }),
						TITLES.TOP_3S({ count: p2.top3.value }),
						TITLES.TOP_5S({ count: p2.top5.value }),
						TITLES.TOP_6S({ count: p2.top6.value }),
						TITLES.TOP_10S({ count: p2.top10.value }),
						TITLES.TOP_12S({ count: p2.top12.value }),
						TITLES.TOP_25S({ count: p2.top25.value })
					].join('\n')
				)
			);

		if (p10) {
			display.addPage((embed: MessageEmbed) =>
				embed.setDescription(
					[
						TITLES.DUOS,
						TITLES.WINS({ count: p10.top1.value }),
						TITLES.KILLS({ count: p10.kills.value }),
						TITLES.KDR({ count: p10.kd.value }),
						TITLES.MATCHES_PLAYED({ count: p10.matches.value }),
						TITLES.TOP_1S({ count: p10.top1.value }),
						TITLES.TOP_3S({ count: p10.top3.value }),
						TITLES.TOP_5S({ count: p10.top5.value }),
						TITLES.TOP_6S({ count: p10.top6.value }),
						TITLES.TOP_10S({ count: p10.top10.value }),
						TITLES.TOP_12S({ count: p10.top12.value }),
						TITLES.TOP_25S({ count: p10.top25.value })
					].join('\n')
				)
			);
		}

		if (p9) {
			display.addPage((embed: MessageEmbed) =>
				embed.setDescription(
					[
						TITLES.SQUADS,
						TITLES.WINS({ count: p9.top1.value }),
						TITLES.KILLS({ count: p9.kills.value }),
						TITLES.KDR({ count: p9.kd.value }),
						TITLES.MATCHES_PLAYED({ count: p9.matches.value }),
						TITLES.TOP_1S({ count: p9.top1.value }),
						TITLES.TOP_3S({ count: p9.top3.value }),
						TITLES.TOP_5S({ count: p9.top5.value }),
						TITLES.TOP_6S({ count: p9.top6.value }),
						TITLES.TOP_10S({ count: p9.top10.value }),
						TITLES.TOP_12S({ count: p9.top12.value }),
						TITLES.TOP_25S({ count: p9.top25.value })
					].join('\n')
				)
			);
		}

		return display;
	}
}

type platform = 'xbox' | 'psn' | 'pc';
