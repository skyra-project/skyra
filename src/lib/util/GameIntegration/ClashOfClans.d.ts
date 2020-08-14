export namespace ClashOfClans {
	export interface Player {
		league?: League;
		clan?: PlayerClan;
		role?: string;
		attackWins: number;
		defenseWins: number;
		townHallLevel: number;
		townHallWeaponLevel?: number;
		versusBattleWins: number;
		legendStatistics: LegendStatistics;
		troops: Troop[];
		heroes: Hero[];
		spells: Spell[];
		labels: Label[];
		tag: string;
		name: string;
		expLevel: number;
		trophies: number;
		bestTrophies: number;
		donations: number;
		donationsReceived: number;
		builderHallLevel: number;
		versusTrophies: number;
		bestVersusTrophies: number;
		warStars: number;
		achievements: Achievement[];
	}

	export interface Clan {
		memberList: MemberList[];
		tag: string;
		requiredTrophies: number;
		warFrequency: 'moreThanOncePerWeek' | 'unknown' | 'always' | 'oncePerWeek' | 'lessThanOncePerWeek';
		clanLevel: number;
		warWinStreak: number;
		warWins: number;
		warTies?: number;
		warLosses?: number;
		isWarLogPublic: boolean;
		clanPoints: number;
		clanVersusPoints: number;
		labels: Label[];
		name: string;
		location?: Location;
		type: string;
		members: number;
		description?: string;
		badgeUrls: ClanBadgeUrls;
	}

	export interface ClansResponse {
		items: Clan[];
		paging: {
			cursors: {
				before?: string;
				after: string;
			};
		};
	}

	export interface League {
		name: string;
		id: number;
		iconUrls: LeagueIconUrls;
	}

	export interface LeagueIconUrls {
		medium: string;
		small: string;
		tiny: string;
	}

	export interface PlayerClan {
		tag: string;
		clanLevel: number;
		name: string;
		badgeUrls: ClanBadgeUrls;
	}

	export interface CurrentSeason {
		trophies: number;
		id: string;
		rank: number;
	}

	export interface PreviousSeason {
		trophies: number;
		id: string;
		rank: number;
	}

	export interface BestSeason {
		trophies: number;
		id: string;
		rank: number;
	}

	export interface PreviousVersusSeason {
		trophies: number;
		id: string;
		rank: number;
	}

	export interface BestVersusSeason {
		trophies: number;
		id: string;
		rank: number;
	}

	export interface LegendStatistics {
		currentSeason: CurrentSeason;
		previousSeason: PreviousSeason;
		bestSeason: BestSeason;
		previousVersusSeason: PreviousVersusSeason;
		bestVersusSeason: BestVersusSeason;
		legendTrophies: number;
	}

	export interface Troop {
		level: number;
		name: string;
		maxLevel: number;
		village: string;
	}

	export interface Hero {
		level: number;
		name: string;
		maxLevel: number;
		village: string;
	}

	export interface Spell {
		level: number;
		name: string;
		maxLevel: number;
		village: string;
	}

	export interface Label {
		name: string;
		id: number;
		iconUrls: LabelIcons;
	}

	export interface LabelIcons {
		medium: string;
		small: string;
	}

	export interface Achievement {
		stars: number;
		value: number;
		name: string;
		target: number;
		info: string;
		completionInfo: string;
		village: string;
	}

	export interface ClanBadgeUrls {
		large: string;
		medium: string;
		small: string;
	}

	export interface MemberList {
		league: League;
		tag: string;
		name: string;
		role: string;
		expLevel: number;
		clanRank: number;
		previousClanRank: number;
		donations: number;
		donationsReceived: number;
		trophies: number;
		versusTrophies: number;
	}

	export interface Location {
		localizedName: string;
		id: number;
		name: string;
		isCountry: boolean;
		countryCode: string;
	}
}
