export interface RawDashboardUserSettings {
	id: string;
	access_token: string;
	refresh_token: string;
	expires_at: string;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS dashboard_users (
		"id"            VARCHAR(19) NOT NULL,
		"access_token"  CHAR(30)    NOT NULL,
		"refresh_token" CHAR(30)    NOT NULL,
		"expires_at"    BIGINT      NOT NULL,
		CONSTRAINT dashboard_users_user_idx PRIMARY KEY ("id")
	);
`;
