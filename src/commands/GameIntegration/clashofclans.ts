import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { ClashOfClans } from '#lib/types/definitions/ClashOfClans';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { URL } from 'node:url';

const enum ClashOfClansFetchCategories {
	PLAYERS = 'players',
	CLANS = 'clans'
}

const playerTagRegex = /^#?[0289PYLQGRJCUV]{3,9}$/;
const filterSpecialCharacters = /[^A-Z0-9]+/gi;

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('CLASH_OF_CLANS_TOKEN'),
	aliases: ['coc'],
	description: LanguageKeys.Commands.GameIntegration.ClashOfClansDescription,
	detailedDescription: LanguageKeys.Commands.GameIntegration.ClashOfClansExtended,
	subCommands: ['player', { input: 'clan', default: true }]
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async clan(message: Message, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const clan = await args.rest('string');
		const response = await sendLoadingMessage(message, t);

		const { items: clanData } = await this.fetchAPI<ClashOfClansFetchCategories.CLANS>(t, clan, ClashOfClansFetchCategories.CLANS);

		if (!clanData.length) this.error(LanguageKeys.Commands.GameIntegration.ClashOfClansClansQueryFail, { clan });

		const display = await this.buildClanDisplay(message, t, clanData);

		await display.run(response, message.author);
		return response;
	}

	public async player(message: Message, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const player = await args.pick(UserPaginatedMessageCommand.playerTagResolver);
		const playerData = await this.fetchAPI<ClashOfClansFetchCategories.PLAYERS>(t, player, ClashOfClansFetchCategories.PLAYERS);

		const embed = await this.buildPlayerEmbed(message, t, playerData);
		return send(message, { embeds: [embed] });
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
						Authorization: `Bearer ${process.env.CLASH_OF_CLANS_TOKEN}`
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

	private async buildPlayerEmbed(message: Message, t: TFunction, player: ClashOfClans.Player) {
		const titles = t(LanguageKeys.Commands.GameIntegration.ClashOfClansPlayerEmbedTitles);

		return new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setThumbnail(player.league?.iconUrls?.medium ?? '')
			.setAuthor(
				`${player.tag} - ${player.name}`,
				player.clan?.badgeUrls.large ?? '',
				`https://www.clashleaders.com/player/${player.name.toLowerCase().replace(filterSpecialCharacters, '-')}-${player.tag
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

	private async buildClanDisplay(message: Message, t: TFunction, clans: ClashOfClans.Clan[]) {
		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(await this.container.db.fetchColor(message)) });

		for (const clan of clans) {
			const titles = t(LanguageKeys.Commands.GameIntegration.ClashOfClansClanEmbedTitles);
			display.addPageEmbed((embed) =>
				embed
					.setThumbnail(clan.badgeUrls.large)
					.setTitle(`${clan.tag} - ${clan.name}`)
					.setURL(
						`https://www.clashleaders.com/clan/${clan.name.toLowerCase().replace(filterSpecialCharacters, '-')}-${clan.tag
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

	public static playerTagResolver = Args.make<string>((parameter, { argument }) => {
		const upperCaseParameter = parameter.toUpperCase();

		if (playerTagRegex.test(upperCaseParameter)) {
			return Args.ok(upperCaseParameter.startsWith('#') ? upperCaseParameter : `#${upperCaseParameter}`);
		}

		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.GameIntegration.ClashOfClansInvalidPlayerTag });
	});
}
