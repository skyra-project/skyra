export interface RawCommandCounterSettings {
	id: string;
	uses: number;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS command_counter (
		"id"   VARCHAR(32) NOT NULL,
		"uses" INTEGER     NOT NULL,
		PRIMARY KEY("id"),
		CHECK("uses" >= 0)
	);
`;
