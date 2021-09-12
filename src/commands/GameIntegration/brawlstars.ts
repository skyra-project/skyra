import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { BrawlStars } from '#lib/types/definitions/BrawlStars';
import { BrawlStarsEmojis, Emojis } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { URL } from 'url';

const kTagRegex = /^#?[0289PYLQGRJCUV]{3,9}$/;

const kTotalBrawlers = 50; // this will need updating
const kMaxMembers = 100;

const flags = ['s', 'save'];

const kRoboRumbleLevels = [
	'Normal',
	'Hard',
	'Expert',
	'Master',
	'Insane',
	'Insane II',
	'Insane III',
	'Insane IV',
	'Insane V',
	'Insane VI',
	'Insane VII',
	'Insane VIII',
	'Insane IX',
	'Insane X',
	'Insane XI',
	'Insane XII',
	'Insane XIII',
	'Insane XIV',
	'Insane XV',
	'Insane XVI'
];

const enum BrawlStarsFetchCategories {
	PLAYERS = 'players',
	CLUB = 'clubs'
}

export interface BrawlStarsGIData {
	playerTag?: string;
	clubTag?: string;
}

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('BRAWL_STARS_TOKEN'),
	aliases: ['bs'],
	description: LanguageKeys.Commands.GameIntegration.BrawlStarsDescription,
	detailedDescription: LanguageKeys.Commands.GameIntegration.BrawlStarsExtended,
	flags,
	subCommands: [{ input: 'player', default: true }, 'club']
})
export class UserCommand extends SkyraCommand {
	public async player(message: Message, args: SkyraCommand.Args) {
		const { users } = this.container.db;
		const bsData = await users.fetchIntegration<BrawlStarsGIData>(this.name, message.author);

		const tag = (args.finished && bsData.extraData?.playerTag) || (await args.pick(UserCommand.tagResolver));
		const playerData = await this.fetchAPI<BrawlStarsFetchCategories.PLAYERS>(args.t, tag, BrawlStarsFetchCategories.PLAYERS);
		const saveFlag = args.getFlags(...flags);

		if (saveFlag) {
			bsData.extraData = { ...bsData.extraData, playerTag: playerData.tag };
			await bsData.save();
		}

		const embed = await this.buildPlayerEmbed(message, args.t, playerData);
		return send(message, { embeds: [embed] });
	}

	public async club(message: Message, args: SkyraCommand.Args) {
		const { users } = this.container.db;
		const bsData = await users.fetchIntegration<BrawlStarsGIData>(this.name, message.author);

		const tag = (args.finished && bsData.extraData?.playerTag) || (await args.pick(UserCommand.tagResolver));
		const clubData = await this.fetchAPI<BrawlStarsFetchCategories.CLUB>(args.t, tag, BrawlStarsFetchCategories.CLUB);
		const saveFlag = args.getFlags(...flags);

		if (saveFlag) {
			bsData.extraData = { ...bsData.extraData, clubTag: clubData.tag };
			await bsData.save();
		}

		const embed = await this.buildClubEmbed(message, args.t, clubData);
		return send(message, { embeds: [embed] });
	}

	private async buildPlayerEmbed(message: Message, t: TFunction, player: BrawlStars.Player) {
		const titles = t(LanguageKeys.Commands.GameIntegration.BrawlStarsPlayerEmbedTitles);
		const fields = t(LanguageKeys.Commands.GameIntegration.BrawlStarsPlayerEmbedFields);

		const color = isNullishOrEmpty(player.nameColor) ? await this.container.db.fetchColor(message) : Number(player.nameColor.substr(4));
		return new MessageEmbed()
			.setColor(color)
			.setTitle(`${player.name} - ${player.tag}`)
			.setURL(`https://brawlstats.com/profile/${player.tag.substr(1)}`)
			.addField(
				titles.trophies,
				[
					`${BrawlStarsEmojis.Trophy} **${fields.total}**: ${formatNumber(t, player.trophies)}`,
					`${BrawlStarsEmojis.Trophy} **${fields.personalBest}**: ${formatNumber(t, player.highestTrophies)}`
				].join('\n')
			)
			.addField(
				titles.exp,
				[
					`${BrawlStarsEmojis.Exp} **${fields.experienceLevel}**: ${player.expLevel} (${formatNumber(t, player.expPoints)})`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.total}**: ${formatNumber(t, player.powerPlayPoints ?? 0)}`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.personalBest}**: ${formatNumber(t, player.highestPowerPlayPoints ?? 0)}`
				].join('\n')
			)
			.addField(
				titles.events,
				[
					`${BrawlStarsEmojis.RoboRumble} **${fields.roboRumble}**: ${kRoboRumbleLevels[player.bestRoboRumbleTime]}`,
					`${BrawlStarsEmojis.ChampionshipChallenge} **${fields.qualifiedForChamps}**: ${
						player.isQualifiedFromChampionshipChallenge ? Emojis.GreenTick : Emojis.RedCross
					}`
				].join('\n')
			)
			.addField(
				titles.gamesModes,
				[
					`${BrawlStarsEmojis.GemGrab} **${fields.victories3v3}**: ${formatNumber(t, player['3vs3Victories'])}`,
					`${BrawlStarsEmojis.SoloShowdown} **${fields.victoriesSolo}**: ${formatNumber(t, player.soloVictories)}`,
					`${BrawlStarsEmojis.DuoShowdown} **${fields.victoriesDuo}**: ${formatNumber(t, player.duoVictories)}`
				].join('\n')
			)
			.addField(
				titles.other,
				[
					player.club.name
						? `**${fields.club}**: [${player.club.name}](https://brawlstats.com/club/${player.club.tag.substr(1)}) (${player.club.tag})`
						: '',
					`**${fields.brawlersUnlocked}**: ${player.brawlers.length} / ${kTotalBrawlers}`
				]
					.filter((line) => line !== '')
					.join('\n')
			);
	}

	private async buildClubEmbed(message: Message, t: TFunction, club: BrawlStars.Club) {
		const titles = t(LanguageKeys.Commands.GameIntegration.BrawlStarsClubEmbedTitles);
		const fields = t(LanguageKeys.Commands.GameIntegration.BrawlStarsClubEmbedFields);

		const averageTrophies = Math.round(club.trophies / club.members.length);
		const mapMembers = (member: BrawlStars.ClubMember, i: number) =>
			`${i + 1}. ${member.name} (${BrawlStarsEmojis.Trophy} ${formatNumber(t, member.trophies)})`;
		const president = club.members.find((member) => member.role === 'president');

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(`${club.name} - ${club.tag}`)
			.setURL(`https://brawlstats.com/club/${club.tag.substr(1)}`)
			.addField(titles.totalTrophies, `${BrawlStarsEmojis.Trophy} ${formatNumber(t, club.trophies)}`)
			.addField(titles.averageTrophies, `${BrawlStarsEmojis.Trophy} ${formatNumber(t, averageTrophies)}`)
			.addField(titles.requiredTrophies, `${BrawlStarsEmojis.Trophy} ${formatNumber(t, club.requiredTrophies)}+`)
			.addField(titles.members, `${club.members.length} / ${kMaxMembers}`)
			.addField(titles.type, club.type)
			.addField(titles.president, president?.name || fields.noPresident)
			.addField(titles.top5Members, club.members.slice(0, 5).map(mapMembers).join('\n'));

		if (club.description !== '') embed.setDescription(club.description);

		return embed;
	}

	private async fetchAPI<C extends BrawlStarsFetchCategories>(t: TFunction, query: string, category: BrawlStarsFetchCategories) {
		try {
			const url = new URL(`https://api.brawlstars.com/v1/${category}/`);
			url.href += encodeURIComponent(query);

			return await fetch<C extends BrawlStarsFetchCategories.CLUB ? any : BrawlStars.Player>(
				url,
				{
					headers: {
						Authorization: `Bearer ${process.env.BRAWL_STARS_TOKEN}`
					}
				},
				FetchResultTypes.JSON
			);
		} catch {
			throw category === BrawlStarsFetchCategories.CLUB
				? t(LanguageKeys.Commands.GameIntegration.BrawlStarsClansQueryFail, { clan: query })
				: t(LanguageKeys.Commands.GameIntegration.BrawlStarsPlayersQueryFail, { playertag: query });
		}
	}

	private static tagResolver = Args.make<string>((parameter, { argument }) => {
		if (kTagRegex.test(parameter)) return Args.ok(parameter.startsWith('#') ? parameter : `#${parameter}`);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.GameIntegration.BrawlStarsInvalidPlayerTag });
	});
}
