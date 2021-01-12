import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { ClashOfClans } from '#utils/GameIntegration/ClashOfClans';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

const enum ClashOfClansFetchCategories {
	PLAYERS = 'players',
	CLANS = 'clans'
}

const kPlayerTagRegex = /#[A-Z0-9]{3,}/;
const kFilterSpecialCharacters = /[^A-Z0-9]+/gi;

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['coc'],
	cooldown: 10,
	description: LanguageKeys.Commands.GameIntegration.ClashOfClansDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.ClashOfClansExtended,
	subcommands: true,
	usage: '<player|clan:default> <query:tagOrName>',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'tagOrName',
		async (arg, possible, message, [action]) => {
			if (action === 'clan') {
				return message.client.arguments.get('...string')!.run(arg, possible, message);
			}

			if (action === 'player') {
				if (kPlayerTagRegex.test(arg)) return arg;
				throw await message.resolveKey(LanguageKeys.Commands.GameIntegration.ClashOfClansInvalidPlayerTag, { playertag: arg });
			}

			throw await message.resolveKey(LanguageKeys.System.QueryFail);
		}
	]
])
export default class extends RichDisplayCommand {
	public async clan(message: GuildMessage, [clan]: [string]) {
		const t = await message.fetchT();

		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { items: clanData } = await this.fetchAPI<ClashOfClansFetchCategories.CLANS>(t, clan, ClashOfClansFetchCategories.CLANS);

		if (!clanData.length) throw t(LanguageKeys.Commands.GameIntegration.ClashOfClansClansQueryFail, { clan });

		const display = await this.buildClanDisplay(message, t, clanData);

		await display.start(response, message.author.id);
		return response;
	}

	public async player(message: GuildMessage, [player]: [string]) {
		const language = await message.fetchT();
		const playerData = await this.fetchAPI<ClashOfClansFetchCategories.PLAYERS>(language, player, ClashOfClansFetchCategories.PLAYERS);
		return message.send(await this.buildPlayerEmbed(message, language, playerData));
	}

	private async fetchAPI<C extends ClashOfClansFetchCategories>(t: TFunction, query: string, category: ClashOfClansFetchCategories) {
		try {
			const url = new URL(`https://api.clashofclans.com/v1/${category}/`);

			if (category === ClashOfClansFetchCategories.CLANS) {
				url.searchParams.append('name', query);
				url.searchParams.append('limit', '10');
			} else {
				url.href += encodeURIComponent(query);
			}

			return await fetch<C extends ClashOfClansFetchCategories.CLANS ? ClashOfClans.ClansResponse : ClashOfClans.Player>(
				url,
				{
					headers: {
						Authorization: `Bearer ${TOKENS.CLASH_OF_CLANS_KEY}`
					}
				},
				FetchResultTypes.JSON
			);
		} catch {
			throw category === ClashOfClansFetchCategories.CLANS
				? t(LanguageKeys.Commands.GameIntegration.ClashOfClansClansQueryFail, { clan: query })
				: t(LanguageKeys.Commands.GameIntegration.ClashOfClansPlayersQueryFail, { playertag: query });
		}
	}

	private async buildPlayerEmbed(message: GuildMessage, t: TFunction, player: ClashOfClans.Player) {
		const titles = t(LanguageKeys.Commands.GameIntegration.ClashOfClansPlayerEmbedTitles);

		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setThumbnail(player.league?.iconUrls?.medium ?? '')
			.setAuthor(
				`${player.tag} - ${player.name}`,
				player.clan?.badgeUrls.large ?? '',
				`https://www.clashleaders.com/player/${player.name.toLowerCase().replace(kFilterSpecialCharacters, '-')}-${player.tag
					.slice(1)
					.toLowerCase()}`
			)
			.setDescription(
				[
					`**${titles.xpLevel}**: ${player.expLevel}`,
					`**${titles.builderHallLevel}**: ${player.builderHallLevel}`,
					`**${titles.townhallLevel}**: ${player.townHallLevel}`,
					`**${titles.townhallWeaponLevel}**: ${player.townHallWeaponLevel ?? titles.noTownhallWeaponLevel}`,
					`**${titles.trophies}**: ${player.trophies}`,
					`**${titles.bestTrophies}**: ${player.bestTrophies}`,
					`**${titles.warStars}**: ${player.warStars}`,
					`**${titles.attackWins}**: ${player.attackWins}`,
					`**${titles.defenseWins}**: ${player.defenseWins}`,
					`**${titles.amountOfAchievements}**: ${player.achievements.length}`,
					`**${titles.versusTrophies}**: ${player.versusTrophies}`,
					`**${titles.bestVersusTrophies}**: ${player.bestVersusTrophies}`,
					`**${titles.versusBattleWins}**: ${player.versusBattleWins}`,
					`**${titles.clanRole}**: ${toTitleCase(player.role ?? titles.noRole)}`,
					`**${titles.clanName}**: ${player.clan?.name ?? titles.noClan}`,
					`**${titles.leagueName}**: ${player.league?.name ?? titles.noLeague}`
				].join('\n')
			);
	}

	private async buildClanDisplay(message: GuildMessage, t: TFunction, clans: ClashOfClans.Clan[]) {
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const clan of clans) {
			const titles = t(LanguageKeys.Commands.GameIntegration.ClashOfClansClanEmbedTitles);
			display.addPage((embed: MessageEmbed) =>
				embed
					.setThumbnail(clan.badgeUrls.large)
					.setTitle(`${clan.tag} - ${clan.name}`)
					.setURL(
						`https://www.clashleaders.com/clan/${clan.name.toLowerCase().replace(kFilterSpecialCharacters, '-')}-${clan.tag
							.slice(1)
							.toLowerCase()}`
					)
					.setDescription(
						[
							`**${titles.clanLevel}**: ${clan.clanLevel}`,
							`**${titles.clanPoints}**: ${clan.clanPoints}`,
							`**${titles.clanVersusPoints}**: ${clan.clanVersusPoints}`,
							`**${titles.amountOfMembers}**: ${clan.members}`,
							clan.description ? `**${titles.description}**: ${clan.description}` : null,
							clan.location
								? `**${titles.locationName}**: ${
										clan.location.isCountry ? `:flag_${clan.location.countryCode.toLowerCase()}:` : ''
								  } ${clan.location.name}`
								: null,
							// Adding TITLES.UNKNOWN in here in case the API changes the designation for war frequency
							`**${titles.warFrequency}**: ${titles.warFrequencyDescr[clan.warFrequency] ?? titles.unknown}`,
							`**${titles.warWinStreak}**: ${clan.warWinStreak}`,
							`**${titles.warWins}**: ${clan.warWins}`,
							`**${titles.warTies}**: ${clan.warTies ?? titles.unknown}`,
							`**${titles.warLosses}**: ${clan.warLosses ?? titles.unknown}`,
							`**${titles.warLogPublic}**: ${t(clan.isWarLogPublic ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)}`
						]
							.filter((val) => val !== null)
							.join('\n')
					)
			);
		}

		return display;
	}
}
