import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { BrawlStars } from '#lib/types/definitions/BrawlStars';
import { TOKENS } from '#root/config';
import { BrawlStarsEmojis, Emojis } from '#utils/constants';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

const kTagRegex = /#[A-Z0-9]{3,}/;

const kTotalBrawlers = 43; // this will need updating
const kMaxMembers = 100;

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

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['bs'],
	description: LanguageKeys.Commands.GameIntegration.BrawlStarsDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.BrawlStarsExtended,
	subcommands: true,
	flagSupport: true,
	usage: '<club|player:default> [tag:tag]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'tag',
		async (arg, _possible, message) => {
			if (kTagRegex.test(arg)) return arg;
			throw await message.resolveKey(LanguageKeys.Commands.GameIntegration.BrawlStarsInvalidPlayerTag, { playertag: arg });
		}
	]
])
export default class extends SkyraCommand {
	public async player(message: Message, [tag]: [string]) {
		const { users } = await DbSet.connect();
		const bsData = await users.fetchIntegration<BrawlStarsGIData>(this.name, message.author);
		const t = await message.fetchT();

		if (!tag && bsData.extraData?.playerTag) {
			tag = bsData.extraData.playerTag!;
		} else if (!tag) {
			throw t(LanguageKeys.Resolvers.InvalidString, { name: 'tag' });
		}

		const playerData = await this.fetchAPI<BrawlStarsFetchCategories.PLAYERS>(t, tag, BrawlStarsFetchCategories.PLAYERS);
		const saveFlag = Reflect.get(message.flagArgs, 'save');

		if (saveFlag) {
			bsData.extraData = { ...bsData.extraData, playerTag: playerData.tag };
			await bsData.save();
		}

		return message.send(await this.buildPlayerEmbed(message, t, playerData));
	}

	public async club(message: Message, [tag]: [string]) {
		const { users } = await DbSet.connect();
		const bsData = await users.fetchIntegration<BrawlStarsGIData>(this.name, message.author);
		const t = await message.fetchT();

		if (!tag && bsData.extraData?.clubTag) {
			tag = bsData.extraData.clubTag!;
		} else if (!tag) {
			throw t(LanguageKeys.Resolvers.InvalidString, { name: 'tag' });
		}

		const clubData = await this.fetchAPI<BrawlStarsFetchCategories.CLUB>(t, tag, BrawlStarsFetchCategories.CLUB);
		const saveFlag = Reflect.get(message.flagArgs, 'save');

		if (saveFlag) {
			bsData.extraData = { ...bsData.extraData, clubTag: clubData.tag };
			await bsData.save();
		}

		return message.send(await this.buildClubEmbed(message, t, clubData));
	}

	private async buildPlayerEmbed(message: Message, t: TFunction, player: BrawlStars.Player) {
		const titles = t(LanguageKeys.Commands.GameIntegration.BrawlStarsPlayerEmbedTitles);
		const fields = t(LanguageKeys.Commands.GameIntegration.BrawlStarsPlayerEmbedFields);
		const digitFormat = (value: number) => t(LanguageKeys.Globals.NumberValue, { value });

		return new MessageEmbed()
			.setColor(player.nameColor?.substr(4) ?? (await DbSet.fetchColor(message)))
			.setTitle(`${player.name} - ${player.tag}`)
			.setURL(`https://brawlstats.com/profile/${player.tag.substr(1)}`)
			.addField(
				titles.trophies,
				[
					`${BrawlStarsEmojis.Trophy} **${fields.total}**: ${digitFormat(player.trophies)}`,
					`${BrawlStarsEmojis.Trophy} **${fields.personalBest}**: ${digitFormat(player.highestTrophies)}`
				].join('\n')
			)
			.addField(
				titles.exp,
				[
					`${BrawlStarsEmojis.Exp} **${fields.experienceLevel}**: ${player.expLevel} (${digitFormat(player.expPoints)})`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.total}**: ${digitFormat(player.powerPlayPoints ?? 0)}`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.personalBest}**: ${digitFormat(player.highestPowerPlayPoints ?? 0)}`
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
					`${BrawlStarsEmojis.GemGrab} **${fields.victories3v3}**: ${digitFormat(player['3vs3Victories'])}`,
					`${BrawlStarsEmojis.SoloShowdown} **${fields.victoriesSolo}**: ${digitFormat(player.soloVictories)}`,
					`${BrawlStarsEmojis.DuoShowdown} **${fields.victoriesDuo}**: ${digitFormat(player.duoVictories)}`
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
		const digitFormat = (value: number) => t(LanguageKeys.Globals.NumberValue, { value });

		const averageTrophies = Math.round(club.trophies / club.members.length);
		const mapMembers = (member: BrawlStars.ClubMember, i: number) =>
			`${i + 1}. ${member.name} (${BrawlStarsEmojis.Trophy} ${digitFormat(member.trophies)})`;
		const president = club.members.find((member) => member.role === 'president');

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(`${club.name} - ${club.tag}`)
			.setURL(`https://brawlstats.com/club/${club.tag.substr(1)}`)
			.addField(titles.totalTrophies, `${BrawlStarsEmojis.Trophy} ${digitFormat(club.trophies)}`)
			.addField(titles.averageTrophies, `${BrawlStarsEmojis.Trophy} ${digitFormat(averageTrophies)}`)
			.addField(titles.requiredTrophies, `${BrawlStarsEmojis.Trophy} ${digitFormat(club.requiredTrophies)}+`)
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
						Authorization: `Bearer ${TOKENS.BRAWL_STARS_KEY}`
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
}
