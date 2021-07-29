// reference: https://developer.brawlstars.com/#/documentation
export namespace BrawlStars {
	export interface Player {
		club: PartialClub;
		'3vs3Victories': number;
		isQualifiedFromChampionshipChallenge: boolean;
		icon: PartialIcon;
		tag: string;
		name: string;
		trophies: number;
		expLevel: number;
		expPoints: number;
		highestTrophies: number;
		powerPlayPoints?: number;
		highestPowerPlayPoints?: number;
		soloVictories: number;
		duoVictories: number;
		bestRoboRumbleTime: number;
		bestTimeAsBigBrawler: number;
		brawlers: PartialBrawler[];
		nameColor: string;
	}

	export interface PartialClub {
		name: string;
		tag: string;
	}

	export interface PartialIcon {
		id: number;
	}

	export interface PartialBrawler {
		starPowers: PartialStarPower[];
		gadgets: PartialGadget[];
		id: number;
		rank: number;
		trophies: number;
		highestTrophies: number;
		power: number;
		name: string;
	}

	export interface PartialStarPower {
		name: string;
		id: number;
	}

	export interface PartialGadget {
		name: string;
		id: number;
	}

	export interface Club {
		tag: string;
		name: string;
		description: string;
		trophies: number;
		requiredTrophies: number;
		members: ClubMember[];
		type: string;
	}

	export interface ClubMember {
		tag: string;
		name: string;
		trophies: number;
		role: string;
		nameColor: string;
	}
}
