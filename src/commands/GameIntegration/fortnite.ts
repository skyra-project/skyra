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
			usage: '[xbox|psn|pc:default] <user:...string>',
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
			const fortniteUser = await fetch(
				`${this.apiBaseUrl}/${platform}/${user}`,
				{ headers: { 'TRN-Api-Key': TOKENS.FORTNITE_KEY } },
				FetchResultTypes.JSON
			) as Fortnite.FortniteUser;

			if (fortniteUser.error) throw 'err'; // This gets handled in the catch, no reason to get the proper error message here.
			return fortniteUser;
		} catch {
			// Either when no user is found (response will have an error message)
			// Or there was a server fault (no json will be returned)
			throw message.language.tget('COMMAND_FORTNITE_NO_USER');
		}
	}

	private buildDisplay(message: KlasaMessage, user: Fortnite.FortniteUser) {
		const TITLES = message.language.tget('COMMAND_FORTNITE_TITLES');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(TITLES.TITLE(user.epicUserHandle))
				.setURL(encodeURI(`https://fortnitetracker.com/profile/${user.platformName}/${user.epicUserHandle}`))
				.setColor(getColor(message))
		);

		display.addPage((embed: MessageEmbed) => embed
			.setDescription([
				TITLES.LIFETIME_STATS,
				TITLES.WINS(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'wins')!.value),
				TITLES.KILLS(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'kills')!.value),
				TITLES.KDR(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'k/d')!.value),
				TITLES.MATCHES_PLAYED(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'matches played')!.value),
				TITLES.TOP_3S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 3s')!.value),
				TITLES.TOP_5S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 5s')!.value),
				TITLES.TOP_6S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 6s')!.value),
				TITLES.TOP_10S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 10')!.value),
				TITLES.TOP_12S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 12s')!.value),
				TITLES.TOP_25S(user.lifeTimeStats.find(el => el.key.toLowerCase() === 'top 25s')!.value)
			].join('\n')))
			.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.SOLOS,
					TITLES.WINS(user.stats.p2.top1.value),
					TITLES.KILLS(user.stats.p2.kills.value),
					TITLES.KDR(user.stats.p2.kd.value),
					TITLES.MATCHES_PLAYED(user.stats.p2.matches.value),
					TITLES.TOP_1S(user.stats.p2.top1.value),
					TITLES.TOP_3S(user.stats.p2.top3.value),
					TITLES.TOP_5S(user.stats.p2.top5.value),
					TITLES.TOP_6S(user.stats.p2.top6.value),
					TITLES.TOP_10S(user.stats.p2.top10.value),
					TITLES.TOP_12S(user.stats.p2.top12.value),
					TITLES.TOP_25S(user.stats.p2.top25.value)
				].join('\n')))
			.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.DUOS,
					TITLES.WINS(user.stats.p10.top1.value),
					TITLES.KILLS(user.stats.p10.kills.value),
					TITLES.KDR(user.stats.p10.kd.value),
					TITLES.MATCHES_PLAYED(user.stats.p10.matches.value),
					TITLES.TOP_1S(user.stats.p10.top1.value),
					TITLES.TOP_3S(user.stats.p10.top3.value),
					TITLES.TOP_5S(user.stats.p10.top5.value),
					TITLES.TOP_6S(user.stats.p10.top6.value),
					TITLES.TOP_10S(user.stats.p10.top10.value),
					TITLES.TOP_12S(user.stats.p10.top12.value),
					TITLES.TOP_25S(user.stats.p10.top25.value)
				].join('\n')))
			.addPage((embed: MessageEmbed) => embed
				.setDescription([
					TITLES.SQUADS,
					TITLES.WINS(user.stats.p9.top1.value),
					TITLES.KILLS(user.stats.p9.kills.value),
					TITLES.KDR(user.stats.p9.kd.value),
					TITLES.MATCHES_PLAYED(user.stats.p9.matches.value),
					TITLES.TOP_1S(user.stats.p9.top1.value),
					TITLES.TOP_3S(user.stats.p9.top3.value),
					TITLES.TOP_5S(user.stats.p9.top5.value),
					TITLES.TOP_6S(user.stats.p9.top6.value),
					TITLES.TOP_10S(user.stats.p9.top10.value),
					TITLES.TOP_12S(user.stats.p9.top12.value),
					TITLES.TOP_25S(user.stats.p9.top25.value)
				].join('\n')));

		return display;
	}

}

type platform = 'xbox' | 'psn' | 'pc';
