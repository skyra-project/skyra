export interface AlgoliaResult<T> {
	exhaustiveNbHits: boolean;

	exhaustiveTypo: boolean;

	hits: T[];

	hitsPerPage: number;

	nbHits: number;

	nbPages: number;

	page: number;

	params: string;

	processingTimeMS: number;

	query: string;

	queryAfterRemoval: string;
}
