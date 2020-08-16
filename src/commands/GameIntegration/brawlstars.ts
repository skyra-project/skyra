import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { BrawlStars } from '@utils/GameIntegration/BrawlStars';
import { TOKENS } from '@root/config';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { BrawlStarsEmojis, BrandingColors } from '@utils/constants';
import { DbSet } from '@lib/structures/DbSet';

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

const kBigGameLevels = ['First Blood', 'Double Kill', 'Monster Kill', 'Godlike', 'Rampage'];

const enum BrawlStarsFetchCategories {
	PLAYERS = 'players',
	CLUB = 'clubs'
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['bs'],
	description: (language) => language.tget('COMMAND_BRAWLSTARS_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_BRAWLSTARS_EXTENDED'),
	runIn: ['text'],
	subcommands: true,
	usage: '<club|player:default> <tag:tag>',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'tag',
		(arg, _possible, message) => {
			if (kTagRegex.test(arg)) return arg;
			throw message.language.tget('COMMAND_CLASHOFCLANS_INVALID_PLAYER_TAG', { playertag: arg });
		}
	]
])
export default class extends SkyraCommand {
	public async player(message: KlasaMessage, [tag]: [string]) {
		const playerData = (await this.fetchAPI(message, tag, BrawlStarsFetchCategories.PLAYERS)) as BrawlStars.Player;
		return message.send(await this.buildPlayerEmbed(message, playerData));
	}

	public async club(message: KlasaMessage, [tag]: [string]) {
		const clubData = (await this.fetchAPI(message, tag, BrawlStarsFetchCategories.CLUB)) as BrawlStars.Club;
		return message.send(await this.buildClubEmbed(message, clubData));
	}

	private async buildPlayerEmbed(message: KlasaMessage, player: BrawlStars.Player) {
		const TITLES = message.language.tget('COMMAND_BRAWLSTARS_PLAYER_EMBED_TITLES');
		const FIELDS = message.language.tget('COMMAND_BRAWLSTARS_PLAYER_EMBED_FIELDS');

		return new MessageEmbed()
			.setColor(player.nameColor?.substr(4) || BrandingColors.Primary)
			.setTitle(`${player.name} - ${player.tag}`)
			.setURL(`https://brawlstats.com/profile/${player.tag.substr(1)}`)
			.addField(
				TITLES.TROPHIES,
				[
					`${BrawlStarsEmojis.Trophy} **${FIELDS.TOTAL}**: ${player.trophies.toLocaleString(message.language.name)}`,
					`${BrawlStarsEmojis.Trophy} **${FIELDS.PERSONAL_BEST}**: ${player.highestTrophies.toLocaleString(message.language.name)}`
				].join('\n')
			)
			.addField(
				TITLES.EXP,
				[
					`${BrawlStarsEmojis.Exp} **${FIELDS.EXPERIENCE_LEVEL}**: ${player.expLevel} (${player.expPoints.toLocaleString(
						message.language.name
					)})`,
					`${BrawlStarsEmojis.PowerPoint} **${FIELDS.TOTAL}**: ${player.powerPlayPoints?.toLocaleString(message.language.name) || 0}`,
					`${BrawlStarsEmojis.PowerPoint} **${FIELDS.PERSONAL_BEST}**: ${
						player.highestPowerPlayPoints?.toLocaleString(message.language.name) || 0
					}`
				].join('\n')
			)
			.addField(
				TITLES.EVENTS,
				[
					`${BrawlStarsEmojis.RoboRumble} **${FIELDS.ROBO_RUMBLE}**: ${kRoboRumbleLevels[player.bestRoboRumbleTime]}`,
					`${BrawlStarsEmojis.BossFight} **${FIELDS.BOSS_FIGHT}**: ${kBigGameLevels[player.bestTimeAsBigBrawler]}`
				].join('\n')
			)
			.addField(
				TITLES.GAME_MODES,
				[
					`${BrawlStarsEmojis.GemGrab} **${FIELDS.VICTORIES_3V3}**: ${player['3vs3Victories'].toLocaleString(message.language.name)}`,
					`${BrawlStarsEmojis.SoloShowdown} **${FIELDS.VICTORIES_SOLO}**: ${player.soloVictories.toLocaleString(message.language.name)}`,
					`${BrawlStarsEmojis.DuoShowdown} **${FIELDS.VICTORIES_DUO}**: ${player.duoVictories.toLocaleString(message.language.name)}`
				].join('\n')
			)
			.addField(
				TITLES.OTHER,
				[
					player.club.name
						? `**${FIELDS.CLUB}**: [${player.club.name}](https://brawlstats.com/club/${player.club.tag.substr(1)}) (${player.club.tag})`
						: '',
					`**${FIELDS.BRAWLERS_UNLOCKED}**: ${player.brawlers.length} / ${kTotalBrawlers}`
				]
					.filter((line) => line !== '')
					.join('\n')
			);
	}

	private async buildClubEmbed(message: KlasaMessage, club: BrawlStars.Club) {
		const TITLES = message.language.tget('COMMAND_BRAWLSTARS_CLUB_EMBED_TITLES');
		const FIELDS = message.language.tget('COMMAND_BRAWLSTARS_CLUB_EMBED_FIELDS');

		const averageTrophies = Math.round(club.trophies / club.members.length);
		const mapMembers = (member: BrawlStars.ClubMember, i: number) =>
			`${i + 1}. ${member.name} (${BrawlStarsEmojis.Trophy} ${member.trophies.toLocaleString(message.language.name)})`;
		const president = club.members.find((member) => member.role === 'president');

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(`${club.name} - ${club.tag}`)
			.setURL(`https://brawlstats.com/club/${club.tag.substr(1)}`)
			.addField(TITLES.TOTAL_TROPHIES, `${BrawlStarsEmojis.Trophy} ${club.trophies.toLocaleString()}`)
			.addField(TITLES.AVERAGE_TROPHIES, `${BrawlStarsEmojis.Trophy} ${averageTrophies.toLocaleString()}`)
			.addField(TITLES.REQUIRED_TROPHIES, `${BrawlStarsEmojis.Trophy} ${club.requiredTrophies.toLocaleString()}+`)
			.addField(TITLES.MEMBERS, `${club.members.length} / ${kMaxMembers}`)
			.addField(TITLES.TYPE, club.type)
			.addField(TITLES.PRESIDENT, president?.name || FIELDS.NO_PRESIDENT)
			.addField(TITLES.TOP_5_MEMBERS, club.members.slice(0, 5).map(mapMembers).join('\n'));

		if (club.description !== '') embed.setDescription(club.description);

		return embed;
	}

	private async fetchAPI<C extends BrawlStarsFetchCategories>(message: KlasaMessage, query: string, category: BrawlStarsFetchCategories) {
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
			if (category === BrawlStarsFetchCategories.CLUB) throw message.language.tget('COMMAND_CLASHOFCLANS_CLANS_QUERY_FAIL', { clan: query });
			else throw message.language.tget('COMMAND_CLASHOFCLANS_PLAYERS_QUERY_FAIL', { playertag: query });
		}
	}
}
