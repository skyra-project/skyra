export interface RawBannerSettings {
	id: string;
	group: string;
	title: string;
	author_id: string;
	price: number;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS banners (
		"id"        VARCHAR(6)   NOT NULL,
		"group"     VARCHAR(32)  NOT NULL,
		"title"     VARCHAR(128) NOT NULL,
		"author_id" VARCHAR(19)  NOT NULL,
		"price"     INTEGER      NOT NULL,
		PRIMARY KEY("id"),
		CHECK("group" <> ''),
		CHECK("title" <> ''),
		CHECK("price" >= 0)
	);
`;
