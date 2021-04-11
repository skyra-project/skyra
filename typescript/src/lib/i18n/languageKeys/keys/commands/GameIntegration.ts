import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const BrawlStarsDescription = T<string>('commands/gameIntegration:brawlstarsDescription');
export const BrawlStarsExtended = T<LanguageHelpDisplayOptions>('commands/gameIntegration:brawlstarsExtended');
export const BrawlStarsPlayerEmbedTitles = T<{ trophies: string; exp: string; events: string; gamesModes: string; other: string }>(
	'commands/gameIntegration:brawlstarsPlayerEmbedTitles'
);
export const BrawlStarsPlayerEmbedFields = T<{
	total: string;
	personalBest: string;
	experienceLevel: string;
	events: string;
	roboRumble: string;
	qualifiedForChamps: string;
	victories3v3: string;
	victoriesDuo: string;
	victoriesSolo: string;
	club: string;
	brawlersUnlocked: string;
}>('commands/gameIntegration:brawlstarsPlayerEmbedFields');
export const BrawlStarsClubEmbedTitles = T<{
	totalTrophies: string;
	averageTrophies: string;
	requiredTrophies: string;
	members: string;
	type: string;
	top5Members: string;
	president: string;
}>('commands/gameIntegration:brawlstarsClubEmbedTitles');
export const BrawlStarsClubEmbedFields = T<{ noPresident: string }>('commands/gameIntegration:brawlstarsClubEmbedFields');
export const ClashOfClansDescription = T<string>('commands/gameIntegration:clashofclansDescription');
export const ClashOfClansExtended = T<LanguageHelpDisplayOptions>('commands/gameIntegration:clashofclansExtended');
export const ClashOfClansPlayerEmbedTitles = T<{
	xpLevel: string;
	builderHallLevel: string;
	townhallLevel: string;
	townhallWeaponLevel: string;
	trophies: string;
	bestTrophies: string;
	warStars: string;
	attackWins: string;
	defenseWins: string;
	amountOfAchievements: string;
	versusTrophies: string;
	bestVersusTrophies: string;
	versusBattleWins: string;
	clanRole: string;
	clanName: string;
	leagueName: string;
	noTownhallWeaponLevel: string;
	noRole: string;
	noClan: string;
	noLeague: string;
}>('commands/gameIntegration:clashofclansPlayerEmbedTitles');
export const ClashOfClansClanEmbedTitles = T<{
	clanLevel: string;
	clanPoints: string;
	clanVersusPoints: string;
	amountOfMembers: string;
	description: string;
	locationName: string;
	warFrequency: string;
	warWinStreak: string;
	warWins: string;
	warTies: string;
	warLosses: string;
	warLogPublic: string;
	unknown: string;
	warFrequencyDescr: {
		moreThanOncePerWeek: string;
		unknown: string;
		always: string;
		oncePerWeek: string;
		lessThanOncePerWeek: string;
	};
}>('commands/gameIntegration:clashofclansClanEmbedTitles');
export const BrawlStarsInvalidPlayerTag = FT<{ playertag: string }, string>('commands/gameIntegration:brawlStarsInvalidPlayerTag');
export const BrawlStarsClansQueryFail = FT<{ clan: string }, string>('commands/gameIntegration:brawlStarsClansQueryFail');
export const BrawlStarsPlayersQueryFail = FT<{ playertag: string }, string>('commands/gameIntegration:brawlStarsPlayersQueryFail');
export const ClashOfClansInvalidPlayerTag = FT<{ playertag: string }, string>('commands/gameIntegration:clashofclansInvalidPlayerTag');
export const ClashOfClansClansQueryFail = FT<{ clan: string }, string>('commands/gameIntegration:clashOfClansClansQueryFail');
export const ClashOfClansPlayersQueryFail = FT<{ playertag: string }, string>('commands/gameIntegration:clashofclansPlayersQueryFail');
export const FFXIVDescription = T<string>('commands/gameIntegration:FFXIVDescription');
export const FFXIVExtended = T<LanguageHelpDisplayOptions>('commands/gameIntegration:FFXIVExtended');
export const FFXIVCharacterFields = T<{
	serverAndDc: string;
	tribe: string;
	characterGender: string;
	nameday: string;
	guardian: string;
	cityState: string;
	grandCompany: string;
	rank: string;
	none: string;
	male: string;
	female: string;
	dowDomClasses: string;
	tank: string;
	healer: string;
	meleeDps: string;
	physicalRangedDps: string;
	magicalRangedDps: string;
	dohClasses: string;
	dolClasses: string;
}>('commands/gameIntegration:FFXIVCharacterFields');
export const FFXIVItemFields = T<{ kind: string; category: string; levelEquip: string; none: string }>('commands/gameIntegration:FFXIVItemFields');
export const FFXIVNoCharacterFound = T<string>('commands/gameIntegration:FFXIVNoCharacterFound');
export const FFXIVInvalidServer = T<string>('commands/gameIntegration:FFXIVInvalidServer');
export const FFXIVNoItemFound = T<string>('commands/gameIntegration:FFXIVNoItemFound');
export const FortniteDescription = T<string>('commands/gameIntegration:fortniteDescription');
export const FortniteExtended = T<LanguageHelpDisplayOptions>('commands/gameIntegration:fortniteExtended');
export const FortniteInvalidPlatform = T<string>('commands/gameIntegration:fortniteInvalidPlatform');
export const FortniteNoUser = T<string>('commands/gameIntegration:fortniteNoUser');
export const FortniteEmbedTitle = FT<{ epicUserHandle: string }, string>('commands/gameIntegration:fortniteEmbedTitle');
export const FortniteEmbedSectionTitles = T<{ lifetimeStats: string; solos: string; duos: string; squads: string }>(
	'commands/gameIntegration:fortniteEmbedSectionTitles'
);
export const FortniteEmbedStats = FT<
	{
		winCount: string;
		killCount: string;
		kdrCount: string;
		matchesPlayedCount: string;
		top1Count: string;
		top3Count: string;
		top5Count: string;
		top6Count: string;
		top10Count: string;
		top12Count: string;
		top25Count: string;
	},
	{
		wins: string;
		kills: string;
		kdr: string;
		matchesPlayed: string;
		top1s: string;
		top3s: string;
		top5s: string;
		top6s: string;
		top10s: string;
		top12s: string;
		top25s: string;
	}
>('commands/gameIntegration:fortniteEmbedStats');
export const OverwatchInvalidPlatform = T<string>('commands/gameIntegration:overwatchInvalidPlatform');
export const OverwatchDescription = T<string>('commands/gameIntegration:overwatchDescription');
export const OverwatchExtended = T<LanguageHelpDisplayOptions>('commands/gameIntegration:overwatchExtended');
export const OverwatchInvalidPlayerName = FT<{ value: string }, string>('commands/gameIntegration:overwatchInvalidPlayerName');
export const OverwatchQueryFail = FT<{ player: string; platform: string }, string>('commands/gameIntegration:overwatchQueryFail');
export const OverwatchNoStats = FT<{ player: string }, string>('commands/gameIntegration:overwatchNoStats');
export const OverwatchEmbedDataStats = FT<
	{
		finalBlows: number;
		deaths: number;
		damageDone: number;
		healing: number;
		objectiveKills: number;
		soloKills: number;
		playTime: number;
		gamesWon: number;
		goldenMedals: number;
		silverMedals: number;
		bronzeMedals: number;
	},
	{
		finalBlows: string;
		deaths: string;
		damageDealt: string;
		healing: string;
		objectiveKills: string;
		soloKills: string;
		playTime: string;
		gamesWon: string;
		goldenMedals: string;
		silverMedals: string;
		bronzeMedals: string;
	}
>('commands/gameIntegration:overwatchEmbedDataStats');
export const OverwatchEmbedDataTopHero = FT<{ name: string; playTime: number }, string>('commands/gameIntegration:overwatchEmbedDataTopHero');
export const OverwatchEmbedData = FT<
	{ authorName: string; playerLevel: number; prestigeLevel: number; totalGamesWon: number },
	OverwatchEmbedDataReturn
>('commands/gameIntegration:overwatchEmbedData');

export interface OverwatchEmbedDataReturn {
	title: string;
	ratingsTitle: string;
	author: string;
	playerLevel: string;
	prestigeLevel: string;
	totalGamesWon: string;
	noGamesWon: string;
	headers: {
		account: string;
		quickplay: string;
		competitive: string;
		topHeroesQuickplay: string;
		topHeroesCompetitive: string;
	};
}
