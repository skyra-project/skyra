import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrawlStarsEmojis, Emojis } from '#utils/constants';
import { BrawlStars } from '#utils/GameIntegration/BrawlStars';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

const kTagRegex = /#[A-Z0-9]{3,}/;

const kTotalBrawlers = 38; // this will need updating
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
	description: LanguageKeys.Commands.GameIntegration.BrawlstarsDescription,
	extendedHelp: LanguageKeys.Commands.GameIntegration.BrawlstarsExtended,
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
	public async player(message: KlasaMessage, [tag]: [string]) {
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

	public async club(message: KlasaMessage, [tag]: [string]) {
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

	private async buildPlayerEmbed(message: KlasaMessage, t: TFunction, player: BrawlStars.Player) {
		const titles = t(LanguageKeys.Commands.GameIntegration.BrawlstarsPlayerEmbedTitles, { returnObjects: true });
		const fields = t(LanguageKeys.Commands.GameIntegration.BrawlstarsPlayerEmbedFields, { returnObjects: true });
		const languageString = t.name;

		return new MessageEmbed()
			.setColor(player.nameColor?.substr(4) ?? (await DbSet.fetchColor(message)))
			.setTitle(`${player.name} - ${player.tag}`)
			.setURL(`https://brawlstats.com/profile/${player.tag.substr(1)}`)
			.addField(
				titles.trophies,
				[
					`${BrawlStarsEmojis.Trophy} **${fields.total}**: ${player.trophies.toLocaleString(languageString)}`,
					`${BrawlStarsEmojis.Trophy} **${fields.personalBest}**: ${player.highestTrophies.toLocaleString(languageString)}`
				].join('\n')
			)
			.addField(
				titles.exp,
				[
					`${BrawlStarsEmojis.Exp} **${fields.experienceLevel}**: ${player.expLevel} (${player.expPoints.toLocaleString(languageString)})`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.total}**: ${player.powerPlayPoints?.toLocaleString(languageString) || 0}`,
					`${BrawlStarsEmojis.PowerPlay} **${fields.personalBest}**: ${player.highestPowerPlayPoints?.toLocaleString(languageString) || 0}`
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
					`${BrawlStarsEmojis.GemGrab} **${fields.victories3v3}**: ${player['3vs3Victories'].toLocaleString(languageString)}`,
					`${BrawlStarsEmojis.SoloShowdown} **${fields.victoriesSolo}**: ${player.soloVictories.toLocaleString(languageString)}`,
					`${BrawlStarsEmojis.DuoShowdown} **${fields.victoriesDuo}**: ${player.duoVictories.toLocaleString(languageString)}`
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

	private async buildClubEmbed(message: KlasaMessage, t: TFunction, club: BrawlStars.Club) {
		const titles = t(LanguageKeys.Commands.GameIntegration.BrawlstarsClubEmbedTitles, { returnObjects: true });
		const fields = t(LanguageKeys.Commands.GameIntegration.BrawlstarsClubEmbedFields, { returnObjects: true });
		const languageString = t.name;

		const averageTrophies = Math.round(club.trophies / club.members.length);
		const mapMembers = (member: BrawlStars.ClubMember, i: number) =>
			`${i + 1}. ${member.name} (${BrawlStarsEmojis.Trophy} ${member.trophies.toLocaleString(languageString)})`;
		const president = club.members.find((member) => member.role === 'president');

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(`${club.name} - ${club.tag}`)
			.setURL(`https://brawlstats.com/club/${club.tag.substr(1)}`)
			.addField(titles.totalTrophies, `${BrawlStarsEmojis.Trophy} ${club.trophies.toLocaleString()}`)
			.addField(titles.averageTrophies, `${BrawlStarsEmojis.Trophy} ${averageTrophies.toLocaleString()}`)
			.addField(titles.requiredTrophies, `${BrawlStarsEmojis.Trophy} ${club.requiredTrophies.toLocaleString()}+`)
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
