export type PlatformUnion = 'pc' | 'psn' | 'xbl';
export type OverwatchStatsTypeUnion = 'competitiveStats' | 'quickPlayStats';

export interface CareerStats extends Record<string, HeroStats | undefined> {
	allHeroes?: HeroStats;
}

export type TopHeroes = Record<string, TopHeroStats>;
export type FormattedDuration = `${bigint}:${bigint}:${bigint}` | `${bigint}:${bigint}` | `${bigint}`;

export interface TopHero {
	hero: string;
	time: number;
}

export interface OverwatchRating {
	level: number;
	role: 'tank' | 'damage' | 'support';
	roleIcon: string;
	rankIcon: string;
}

export interface OverwatchDataSet {
	error: unknown;
	endorsement: number;
	endorsementIcon: string;
	gamesWon: number;
	icon: string;
	level: number;
	levelIcon: string;
	name: string;
	prestige: number;
	prestigeIcon: string;
	private: boolean;
	rating: number;
	ratingIcon: string;
	ratings: OverwatchRating[] | null;
	competitiveStats: StatsGroup;
	quickPlayStats: StatsGroup;
}

interface TopHeroStats {
	eliminationsPerLife: number;
	gamesWon: number;
	multiKillBest: number;
	objectiveKills: number;
	timePlayed: FormattedDuration;
	weaponAccuracy: number;
	winPercentage: number;
}

interface AwardStats {
	cards: number;
	medals: number;
	medalsBronze: number;
	medalsSilver: number;
	medalsGold: number;
}

interface CareerAllHeroesAssists {
	defensiveAssists: number;
	defensiveAssistsAvgPer10Min?: number;
	defensiveAssistsMostInGame?: number;
	healingDone: number;
	healingDoneAvgPer10Min?: number;
	healingDoneMostInGame?: number;
	offensiveAssists: number;
	offensiveAssistsAvgPer10Min?: number;
	offensiveAssistsMostInGame?: number;
}

interface CareerAllHeroesAverage {
	allDamageDoneAvgPer10Min: number;
	barrierDamageDoneAvgPer10Min: number;
	deathsAvgPer10Min: number;
	eliminationsAvgPer10Min: number;
	finalBlowsAvgPer10Min: number;
	healingDoneAvgPer10Min: number;
	heroDamageDoneAvgPer10Min: number;
	objectiveKillsAvgPer10Min: number;
	objectiveTimeAvgPer10Min: FormattedDuration;
	soloKillsAvgPer10Min: number;
	timeSpentOnFireAvgPer10Min: FormattedDuration;
}

interface CareerAllHeroesBest {
	allDamageDoneMostInGame: number;
	barrierDamageDoneMostInGame: number;
	defensiveAssistsMostInGame: number;
	eliminationsMostInGame: number;
	environmentalKillsMostInGame: number;
	finalBlowsMostInGame: number;
	healingDoneMostInGame: number;
	heroDamageDoneMostInGame: number;
	killsStreakBest: number;
	meleeFinalBlowsMostInGame: number;
	multikillsBest: number;
	objectiveKillsMostInGame: number;
	objectiveTimeMostInGame: FormattedDuration;
	offensiveAssistsMostInGame: number;
	soloKillsMostInGame: number;
	teleporterPadsDestroyedMostInGame: number;
	timeSpentOnFireMostInGame: FormattedDuration;
	turretsDestroyedMostInGame: number;
}

interface CareerAllHeroesCombat {
	barrierDamageDone: number;
	damageDone: number;
	deaths: number;
	eliminations: number;
	environmentalKills: number;
	finalBlows: number;
	heroDamageDone: number;
	meleeFinalBlows: number;
	multikills: number;
	objectiveKills: number;
	objectiveTime: FormattedDuration;
	soloKills: number;
	timeSpentOnFire: FormattedDuration;
}

interface CareerAllHeroesGame {
	gamesLost: number;
	gamesPlayed: number;
	gamesTied: number;
	gamesWon: number;
	timePlayed: FormattedDuration;
}

interface CareerAllHeroesMatchAwards {
	cards: number;
	medals: number;
	medalsBronze: number;
	medalsGold: number;
	medalsSilver: number;
}

interface CareerAllHeroesMiscellaneous {
	teleporterPadsDestroyed: number;
	turretsDestroyed: number;
}

interface HeroStats {
	assists?: CareerAllHeroesAssists;
	average?: CareerAllHeroesAverage;
	best?: CareerAllHeroesBest;
	combat?: CareerAllHeroesCombat;
	deaths?: null;
	game?: CareerAllHeroesGame;
	heroSpecific?: null;
	matchAwards?: CareerAllHeroesMatchAwards;
	miscellaneous?: CareerAllHeroesMiscellaneous;
}

interface GamesStats {
	played: number;
	won: number;
}

interface StatsGroup {
	awards?: AwardStats;
	careerStats: CareerStats;
	games?: GamesStats;
	topHeroes: TopHeroes;
}
