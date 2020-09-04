export namespace Fortnite {
	export interface FortniteUser {
		accountId: string;
		platformId: number;
		platformName: string;
		platformNameLong: string;
		epicUserHandle: string;
		stats: Stats;
		lifeTimeStats: LifeTimeStat[];
		recentMatches: RecentMatch[];
		error?: string;
	}

	export interface Score {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top1 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top3 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top5 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top6 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top10 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top12 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top25 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kd {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpm {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpg {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMatch {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface P2 {
		score: Score;
		top1: Top1;
		top3: Top3;
		top5: Top5;
		top6: Top6;
		top10: Top10;
		top12: Top12;
		top25: Top25;
		kd: Kd;
		winRatio: WinRatio;
		matches: Matches;
		kills: Kills;
		minutesPlayed: MinutesPlayed;
		kpm: Kpm;
		kpg: Kpg;
		avgTimePlayed: AvgTimePlayed;
		scorePerMatch: ScorePerMatch;
		scorePerMin: ScorePerMin;
	}

	export interface Score2 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top13 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top32 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top52 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top62 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top102 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top122 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top252 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Kd2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches2 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills2 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed2 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpm2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpg2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMatch2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin2 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface P10 {
		score: Score2;
		top1: Top13;
		top3: Top32;
		top5: Top52;
		top6: Top62;
		top10: Top102;
		top12: Top122;
		top25: Top252;
		kd: Kd2;
		winRatio: WinRatio2;
		matches: Matches2;
		kills: Kills2;
		minutesPlayed: MinutesPlayed2;
		kpm: Kpm2;
		kpg: Kpg2;
		avgTimePlayed: AvgTimePlayed2;
		scorePerMatch: ScorePerMatch2;
		scorePerMin: ScorePerMin2;
	}

	export interface Score3 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top14 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top33 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top53 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top63 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top103 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top123 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top253 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Kd3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches3 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills3 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed3 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpm3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface Kpg3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMatch3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin3 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		percentile: number;
		displayValue: string;
	}

	export interface P9 {
		score: Score3;
		top1: Top14;
		top3: Top33;
		top5: Top53;
		top6: Top63;
		top10: Top103;
		top12: Top123;
		top25: Top253;
		kd: Kd3;
		winRatio: WinRatio3;
		matches: Matches3;
		kills: Kills3;
		minutesPlayed: MinutesPlayed3;
		kpm: Kpm3;
		kpg: Kpg3;
		avgTimePlayed: AvgTimePlayed3;
		scorePerMatch: ScorePerMatch3;
		scorePerMin: ScorePerMin3;
	}

	export interface Score4 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top15 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top34 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top54 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top64 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top104 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top124 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top254 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kd4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches4 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills4 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed4 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		displayValue: string;
	}

	export interface Kpm4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface Kpg4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface ScorePerMatch4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin4 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface CurrP2 {
		score: Score4;
		top1: Top15;
		top3: Top34;
		top5: Top54;
		top6: Top64;
		top10: Top104;
		top12: Top124;
		top25: Top254;
		kd: Kd4;
		winRatio: WinRatio4;
		matches: Matches4;
		kills: Kills4;
		minutesPlayed: MinutesPlayed4;
		kpm: Kpm4;
		kpg: Kpg4;
		avgTimePlayed: AvgTimePlayed4;
		scorePerMatch: ScorePerMatch4;
		scorePerMin: ScorePerMin4;
	}

	export interface Score5 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top16 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top35 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top55 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top65 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top105 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top125 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top255 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Kd5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches5 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills5 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed5 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		displayValue: string;
	}

	export interface Kpm5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface Kpg5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface ScorePerMatch5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin5 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface CurrP10 {
		score: Score5;
		top1: Top16;
		top3: Top35;
		top5: Top55;
		top6: Top65;
		top10: Top105;
		top12: Top125;
		top25: Top255;
		kd: Kd5;
		winRatio: WinRatio5;
		matches: Matches5;
		kills: Kills5;
		minutesPlayed: MinutesPlayed5;
		kpm: Kpm5;
		kpg: Kpg5;
		avgTimePlayed: AvgTimePlayed5;
		scorePerMatch: ScorePerMatch5;
		scorePerMin: ScorePerMin5;
	}

	export interface Score6 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top17 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top36 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top56 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top66 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Top106 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top126 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Top256 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		displayValue: string;
	}

	export interface Kd6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface WinRatio6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Matches6 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface Kills6 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface MinutesPlayed6 {
		label: string;
		field: string;
		category: string;
		valueInt: number;
		value: string;
		displayValue: string;
	}

	export interface Kpm6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface Kpg6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface AvgTimePlayed6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface ScorePerMatch6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		rank: number;
		percentile: number;
		displayValue: string;
	}

	export interface ScorePerMin6 {
		label: string;
		field: string;
		category: string;
		valueDec: number;
		value: string;
		displayValue: string;
	}

	export interface CurrP9 {
		score: Score6;
		top1: Top17;
		top3: Top36;
		top5: Top56;
		top6: Top66;
		top10: Top106;
		top12: Top126;
		top25: Top256;
		kd: Kd6;
		winRatio: WinRatio6;
		matches: Matches6;
		kills: Kills6;
		minutesPlayed: MinutesPlayed6;
		kpm: Kpm6;
		kpg: Kpg6;
		avgTimePlayed: AvgTimePlayed6;
		scorePerMatch: ScorePerMatch6;
		scorePerMin: ScorePerMin6;
	}

	export interface Stats {
		p2?: P2;
		p10?: P10;
		p9?: P9;
		curr_p2: CurrP2;
		curr_p10: CurrP10;
		curr_p9: CurrP9;
	}

	export interface LifeTimeStat {
		key: string;
		value: string;
	}

	export interface RecentMatch {
		id: number;
		accountId: string;
		playlist: string;
		kills: number;
		minutesPlayed: number;
		top1: number;
		top5: number;
		top6: number;
		top10: number;
		top12: number;
		top25: number;
		matches: number;
		top3: number;
		dateCollected: Date;
		score: number;
		platform: number;
		trnRating: number;
		trnRatingChange: number;
		playlistId: number;
		playersOutlived: number;
	}
}
