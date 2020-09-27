import { FT, T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const BrawlstarsDescription = T<string>('commandBrawlstarsDescription');
export const BrawlstarsExtended = T<LanguageHelpDisplayOptions>('commandBrawlstarsExtended');
export const BrawlstarsPlayerEmbedTitles = T<{
	trophies: string;
	exp: string;
	events: string;
	gamesModes: string;
	other: string;
}>('commandBrawlstarsPlayerEmbedTitles');
export const BrawlstarsPlayerEmbedFields = T<{
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
}>('commandBrawlstarsPlayerEmbedFields');
export const BrawlstarsClubEmbedTitles = T<{
	totalTrophies: string;
	averageTrophies: string;
	requiredTrophies: string;
	members: string;
	type: string;
	top5Members: string;
	president: string;
}>('commandBrawlstarsClubEmbedTitles');
export const BrawlstarsClubEmbedFields = T<{
	noPresident: string;
}>('commandBrawlstarsClubEmbedFields');
export const ClashofclansDescription = T<string>('commandClashofclansDescription');
export const ClashofclansExtended = T<LanguageHelpDisplayOptions>('commandClashofclansExtended');
export const ClashofclansPlayerEmbedTitles = T<{
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
}>('commandClashofclansPlayerEmbedTitles');
export const ClashofclansClanEmbedTitles = T<{
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
}>('commandClashofclansClanEmbedTitles');
export const BrawlStarsInvalidPlayerTag = FT<{ playertag: string }, string>('commandBrawlStarsInvalidPlayerTag');
export const BrawlStarsClansQueryFail = FT<{ clan: string }, string>('commandBrawlStarsClansQueryFail');
export const BrawlStarsPlayersQueryFail = FT<{ playertag: string }, string>('commandBrawlStarsPlayersQueryFail');
export const ClashOfClansInvalidPlayerTag = FT<{ playertag: string }, string>('commandClashofclansInvalidPlayerTag');
export const ClashOfClansClansQueryFail = FT<{ clan: string }, string>('commandClashOfClansClansQueryFail');
export const ClashOfClansPlayersQueryFail = FT<{ playertag: string }, string>('commandClashofclansPlayersQueryFail');
export const FFXIVDescription = T<string>('commandFFXIVDescription');
export const FFXIVExtended = T<LanguageHelpDisplayOptions>('commandFFXIVExtended');
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
}>('commandFFXIVCharacterFields');
export const FFXIVItemFields = T<{
	kind: string;
	category: string;
	levelEquip: string;
	none: string;
}>('commandFFXIVItemFields');
export const FFXIVNoCharacterFound = T<string>('commandFFXIVNoCharacterFound');
export const FFXIVInvalidServer = T<string>('commandFFXIVInvalidServer');
export const FFXIVNoItemFound = T<string>('commandFFXIVNoItemFound');
export const FortniteDescription = T<string>('commandFortniteDescription');
export const FortniteExtended = T<LanguageHelpDisplayOptions>('commandFortniteExtended');
export const FortniteNoUser = T<string>('commandFortniteNoUser');
export const FortniteEmbedTitle = FT<{ epicUserHandle: string }, string>('commandFortniteEmbedTitle');
export const FortniteEmbedSectionTitles = T<{
	lifetimeStats: string;
	solos: string;
	duos: string;
	squads: string;
}>('commandFortniteEmbedSectionTitles');
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
>('commandFortniteEmbedStats');
export const OverwatchDescription = T<string>('commandOverwatchDescription');
export const OverwatchExtended = T<LanguageHelpDisplayOptions>('commandOverwatchExtended');
export const OverwatchInvalidPlayerName = FT<{ playerTag: string }, string>('commandOverwatchInvalidPlayerName');
export const OverwatchQueryFail = FT<{ player: string; platform: string }, string>('commandOverwatchQueryFail');
export const OverwatchNoStats = FT<{ player: string }, string>('commandOverwatchNoStats');
export const OverwatchNoAverage = T<string>('commandOverwatchNoAverage');
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
>('commandOverwatchEmbedDataStats');
export const OverwatchEmbedDataTopHero = FT<{ name: string; playTime: string }, string>('commandOverwatchEmbedDataTopHero');
export const OverwatchEmbedData = FT<
	{
		authorName: string;
		playerLevel: number;
		prestigeLevel: number;
		totalGamesWon: number;
	},
	OverwatchEmbedDataReturn
>('commandOverwatchEmbedData');

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
