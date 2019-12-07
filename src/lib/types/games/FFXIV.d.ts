export interface FFXIVPagination {
	Page: number;
	PageNext?: number | boolean;
	PagePrev?: number | boolean;
	Results: number;
	ResultsPerPage: number;
	ResultsTotal: number;
}

export interface FFXIVCharacterSearchResult {
	Avatar: string;
	FeastMatches: number;
	ID: number;
	Lang: string;
	Name: string;
	// TODO(QuantumlyTangled): Document type
	Rank: unknown;
	// TODO(QuantumlyTangled): Document type
	RankIcon: unknown;
	Server: string;
}

export interface FFXIVItemEntry {
	ID: number;
	Icon: string;
	Name: string;
	Url: string;
}

export type FFXIVServerNames = string[];
export type FFXIVItems = FFXIVItemEntry[];

export interface FFXIVResults<T> {
	Pagination: FFXIVPagination;
	Results: T[];
}
