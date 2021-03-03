export namespace FFXIV {
	// eslint-disable-next-line @typescript-eslint/ban-types
	export interface SearchResponse<T extends object> {
		Pagination: Pagination;
		Results: T[];
	}

	export interface Pagination {
		Page: number;
		PageNext: number | boolean | null;
		PagePrev: number | boolean | null;
		PageTotal: number;
		Results: number;
		ResultsPerPage: number;
		ResultsTotal: number;
	}

	export interface CharacterSearchResult {
		Avatar: string;
		FeastMatches: number;
		ID: number;
		Lang: string | null;
		Name: string;
		Rank: unknown | null;
		RankIcon: unknown | null;
		Server: string;
	}

	export interface ItemSearchResult {
		Description: string;
		Icon: string;
		ID: string;
		ItemKind: { Name: string };
		ItemSearchCategory: { Name?: string };
		LevelEquip: number;
		Name: string;
	}

	export const enum ClassSubcategory {
		DoH,
		DoL,
		Tank,
		Healer,
		MDPS,
		PRDPS,
		MRDPS
	}

	export interface ClassMap {
		fullName: string;
		emote: string;
		subcategory: ClassSubcategory;
	}

	export interface CharacterResult {
		Achievements: Achievements;
		AchievementsPublic: boolean;
		Character: Character;
		FreeCompany: FreeCompany;
		FreeCompanyMembers: FreeCompanyMember[];
		Friends: Friend[];
		FriendsPublic: boolean;
		Minions: Minion[];
		Mounts: Minion[];
		PvPTeam?: any;
	}

	interface Minion {
		Icon: string;
		Name: string;
	}

	interface Friend {
		Avatar: string;
		FeastMatches: number;
		ID: number;
		Lang: string;
		Name: string;
		Rank?: any;
		RankIcon?: any;
		Server: string;
	}

	interface FreeCompanyMember {
		Avatar: string;
		FeastMatches: number;
		ID: number;
		Lang?: any;
		Name: string;
		Rank: string;
		RankIcon: string;
		Server: string;
	}

	interface FreeCompany {
		Active: string;
		ActiveMemberCount: number;
		Crest: string[];
		DC: string;
		Estate: Estate;
		Focus: Focus[];
		Formed: number;
		GrandCompany: string;
		ID: string;
		Name: string;
		ParseDate: number;
		Rank: number;
		Ranking: Ranking;
		Recruitment: string;
		Reputation: Reputation[];
		Seeking: any[];
		Server: string;
		Slogan: string;
		Tag: string;
	}

	interface Reputation {
		Name: string;
		Progress: number;
		Rank: string;
	}

	interface Ranking {
		Monthly: number;
		Weekly: string;
	}

	interface Focus {
		Icon: string;
		Name: string;
		Status: boolean;
	}

	interface Estate {
		Greeting: string;
		Name: string;
		Plot: string;
	}

	export interface Character extends Pick<CharacterSearchResult, 'Avatar' | 'ID' | 'Lang' | 'Name' | 'Server'> {
		ActiveClassJob: ActiveClassJob;
		Bio: string;
		ClassJobs: ClassJob[];
		DC: string;
		FreeCompanyId: string;
		GearSet: GearSet;
		Gender: number;
		GenderID: number;
		GrandCompany: GrandCompany;
		GuardianDeity: GuardianDeity;
		Minions: any[];
		MinionsCount: number;
		MinionsProgress: number;
		MinionsTotal: number;
		Mounts: any[];
		MountsCount: number;
		MountsProgress: number;
		MountsTotal: number;
		Nameday: string;
		ParseDate: number;
		Portrait: string;
		PvPTeamId?: any;
		Race: Company;
		Title: Materia;
		TitleTop: boolean;
		Town: Materia;
		Tribe: Tribe;
	}

	interface Tribe {
		ID: number;
		Icon?: any;
		Name: string;
		Url: string;
	}

	interface GuardianDeity {
		GuardianDeity?: any;
		ID: number;
		Icon: string;
		Name: string;
		Url: string;
	}

	interface GrandCompany {
		Company: Company | null;
		Rank: Materia | null;
	}

	interface Company {
		ID: number;
		Name: string;
		Url: string;
	}

	interface GearSet {
		Attributes: Attribute[];
		Class: Job;
		Gear: Gear;
		GearKey: string;
		Job: Job;
		Level: number;
	}

	interface Gear {
		Body: Body;
		Bracelets: Body;
		Earrings: Body;
		Feet: Feet;
		Hands: Body;
		Head: Body;
		Legs: Body;
		MainHand: Feet;
		Necklace: Body;
		Ring1: Body;
		Ring2: Body;
		SoulCrystal: SoulCrystal;
		Waist: Body;
	}

	interface SoulCrystal {
		Creator?: any;
		Dye?: any;
		Item: Item;
		Materia: any[];
		Mirage?: any;
	}

	interface Feet {
		Creator?: any;
		Dye?: any;
		Item: Item;
		Materia: Materia[];
		Mirage: Mirage;
	}

	interface Mirage {
		ID: number;
		Icon: string;
		Name: string;
	}

	interface Body {
		Creator?: any;
		Dye?: any;
		Item: Item;
		Materia: Materia[];
		Mirage?: any;
	}

	interface Materia {
		ID: number;
		Icon: string;
		Name: string;
		Url: string;
	}

	interface Item {
		ClassJobCategory: ClassJobCategory;
		ID: number;
		Icon: string;
		ItemUICategory: ClassJobCategory;
		LevelEquip: number;
		LevelItem: number;
		Name: string;
		Rarity: number;
	}

	interface Attribute {
		Attribute: ClassJobCategory;
		Value: number;
	}

	export interface ClassJob {
		Class: Class;
		ExpLevel: number;
		ExpLevelMax: number;
		ExpLevelTogo: number;
		IsSpecialised: boolean;
		Job: Class;
		Level: number;
		Name: string;
	}

	interface ActiveClassJob {
		Class: Class;
		ExpLevel: number;
		ExpLevelMax: number;
		ExpLevelTogo: number;
		IsSpecialised: boolean;
		Job: Job;
		Level: number;
		Name: string;
	}

	interface Job {
		Abbreviation: string;
		ID: number;
		Icon: string;
		Name: string;
		Url: string;
	}

	interface Class {
		Abbreviation: string;
		ClassJobCategory: ClassJobCategory;
		ID: number;
		Icon: string;
		Name: string;
		Url: string;
	}

	interface ClassJobCategory {
		ID: number;
		Name: string;
	}

	interface Achievements {
		List: List[];
		Points: number;
	}

	interface List {
		Date: number;
		ID: number;
		Icon: string;
		Name: string;
		Points: number;
	}
}
