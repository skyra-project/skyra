import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { TOKENS } from '@root/config';
import { BrandingColors } from '@utils/constants';
import { Fortnite } from '@utils/GameIntegration/Fortnite';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	private apiBaseUrl = 'https://api.fortnitetracker.com/v1/profile/';

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_FORTNITE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FORTNITE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<xbox|psn|pc:default> <user:...string>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [platform, user]: [platform, string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const fortniteUser = await this.fetchAPI(message, user, platform);

		await this.buildDisplay(message, fortniteUser).start(response, message.author.id);
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
			throw message.language.tget('COMMAND_FORTNITE_NO_USER');
		}
	}

	private buildDisplay(message: KlasaMessage, { lifeTimeStats, epicUserHandle, platformName, stats: { p2, p10, p9 } }: Fortnite.FortniteUser) {
		const TITLES = message.language.tget('COMMAND_FORTNITE_TITLES');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(TITLES.TITLE(epicUserHandle))
				.setURL(encodeURI(`https://fortnitetracker.com/profile/${platformName}/${epicUserHandle}`))
				.setColor(getColor(message))
		);
		const lts = lifeTimeStats.map(stat => ({ ...stat, key: stat.key.toLowerCase() }));

		display.addPage((embed: MessageEmbed) => embed
			.setDescription([
				TITLES.LIFETIME_STATS,
				TITLES.WINS(lts.find(el => el.key === 'wins')!.value),
				TITLES.KILLS(lts.find(el => el.key === 'kills')!.value),
				TITLES.KDR(lts.find(el => el.key === 'k/d')!.value),
				TITLES.MATCHES_PLAYED(lts.find(el => el.key === 'matches played')!.value),
				TITLES.TOP_3S(lts.find(el => el.key === 'top 3s')!.value),
				TITLES.TOP_5S(lts.find(el => el.key === 'top 5s')!.value),
				TITLES.TOP_6S(lts.find(el => el.key === 'top 6s')!.value),
				TITLES.TOP_10S(lts.find(el => el.key === 'top 10')!.value),
				TITLES.TOP_12S(lts.find(el => el.key === 'top 12s')!.value),
				TITLES.TOP_25S(lts.find(el => el.key === 'top 25s')!.value)
			].join('\n')))
			.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.SOLOS,
					TITLES.WINS(p2.top1.value),
					TITLES.KILLS(p2.kills.value),
					TITLES.KDR(p2.kd.value),
					TITLES.MATCHES_PLAYED(p2.matches.value),
					TITLES.TOP_1S(p2.top1.value),
					TITLES.TOP_3S(p2.top3.value),
					TITLES.TOP_5S(p2.top5.value),
					TITLES.TOP_6S(p2.top6.value),
					TITLES.TOP_10S(p2.top10.value),
					TITLES.TOP_12S(p2.top12.value),
					TITLES.TOP_25S(p2.top25.value)
				].join('\n')));

		if (p10) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.DUOS,
					TITLES.WINS(p10.top1.value),
					TITLES.KILLS(p10.kills.value),
					TITLES.KDR(p10.kd.value),
					TITLES.MATCHES_PLAYED(p10.matches.value),
					TITLES.TOP_1S(p10.top1.value),
					TITLES.TOP_3S(p10.top3.value),
					TITLES.TOP_5S(p10.top5.value),
					TITLES.TOP_6S(p10.top6.value),
					TITLES.TOP_10S(p10.top10.value),
					TITLES.TOP_12S(p10.top12.value),
					TITLES.TOP_25S(p10.top25.value)
				].join('\n')));
		}

		if (p9) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.SQUADS,
					TITLES.WINS(p9.top1.value),
					TITLES.KILLS(p9.kills.value),
					TITLES.KDR(p9.kd.value),
					TITLES.MATCHES_PLAYED(p9.matches.value),
					TITLES.TOP_1S(p9.top1.value),
					TITLES.TOP_3S(p9.top3.value),
					TITLES.TOP_5S(p9.top5.value),
					TITLES.TOP_6S(p9.top6.value),
					TITLES.TOP_10S(p9.top10.value),
					TITLES.TOP_12S(p9.top12.value),
					TITLES.TOP_25S(p9.top25.value)
				].join('\n')));
		}

		return display;
	}

}

type platform = 'xbox' | 'psn' | 'pc';
