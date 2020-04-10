export type HeroesUnion =
	'ana' | 'brigitte' | 'junkrat' |
	'mei' | 'mercy' | 'moira' |
	'orisa' | 'reinhardt' | 'soldier76' |
	'symmetra' | 'torbjorn' | 'winston' |
	'wreckingBall' | string;

export type PlatformUnion = 'pc' | 'psn' | 'xbl';

export interface TopHeroStats extends Record<string, string | number> {
	timePlayed: string;
	timePlayedInSeconds: number;
	gamesWon: number;
	winPercentage: number;
	weaponAccuracy: number;
	eliminationsPerLife: number;
	multiKillBest: number;
	objectiveKills: number;
}

export interface AwardStats extends Record<string, number> {
	cards: number;
	medals: number;
	medalsBronze: number;
	medalsSilver: number;
	medalsGold: number;
}

export interface CareerAllHeroesAssists extends Record<string, number> {
	defensiveAssists: number;
	defensiveAssistsAvgPer10Min: number;
	defensiveAssistsMostInGame: number;
	healingDone: number;
	healingDoneAvgPer10Min: number;
	healingDoneMostInGame: number;
	offensiveAssists: number;
	offensiveAssistsAvgPer10Min: number;
	offensiveAssistsMostInGame: number;
}

export interface CareerAllHeroesAverage extends Record<string, string | number> {
	allDamageDoneAvgPer10Min: number;
	barrierDamageDoneAvgPer10Min: number;
	deathsAvgPer10Min: number;
	eliminationsAvgPer10Min: number;
	finalBlowsAvgPer10Min: number;
	healingDoneAvgPer10Min: number;
	heroDamageDoneAvgPer10Min: number;
	objectiveKillsAvgPer10Min: number;
	objectiveTimeAvgPer10Min: string;
	soloKillsAvgPer10Min: number;
	timeSpentOnFireAvgPer10Min: string;
}

export interface CareerAllHeroesBest extends Record<string, string | number> {
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
	objectiveTimeMostInGame: string;
	offensiveAssistsMostInGame: number;
	soloKillsMostInGame: number;
	teleporterPadsDestroyedMostInGame: number;
	timeSpentOnFireMostInGame: string;
	turretsDestroyedMostInGame: number;
}

export interface CareerAllHeroesCombat extends Record<string, string | number> {
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
	objectiveTime: string;
	soloKills: number;
	timeSpentOnFire: string;
}

export interface CareerAllHeroesGame extends Record<string, string | number> {
	gamesLost: number;
	gamesPlayed: number;
	gamesTied: number;
	gamesWon: number;
	timePlayed: string;
}

export interface CareerAllHeroesMatchAwards extends Record<string, number> {
	cards: number;
	medals: number;
	medalsBronze: number;
	medalsGold: number;
	medalsSilver: number;
}

export interface CareerAllHeroesMisc extends Record<string, number> {
	teleporterPadsDestroyed: number;
	turretsDestroyed: number;
}


export interface HeroStats {
	assists: CareerAllHeroesAssists;
	average: CareerAllHeroesAverage;
	best: CareerAllHeroesBest;
	combat: CareerAllHeroesCombat;
	deaths: unknown | null;
	heroSpecific: null;
	game: CareerAllHeroesGame;
	matchAwards: CareerAllHeroesMatchAwards;
	miscellaneous?: CareerAllHeroesMisc;
}

export interface CareerStats extends Record<string, HeroStats> {
	allHeroes: HeroStats;
}

export type TopHeroes = Record<string, TopHeroStats>;

export interface TopHero {
	hero: string;
	time: number;
}

export interface GamesStats extends Record<string, number> {
	played: number;
	won: number;
}

export interface StatsGroup {
	awards: AwardStats;
	careerStats: CareerStats;
	games: GamesStats;
	topHeroes: TopHeroes;
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
	ratings: OverwatchRating[];
	competitiveStats: StatsGroup;
	quickPlayStats: StatsGroup;
}
