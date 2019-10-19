import PostgresProvider from '../../providers/postgres';

import { SQL_TABLE_SCHEMA as BannerSchema } from '../types/settings/raw/RawBannerSettings';
import { SQL_TABLE_SCHEMA as CommandCounterSchema } from '../types/settings/raw/RawCommandCounterSettings';
import { SQL_TABLE_SCHEMA as GiveawayTableSchema } from '../types/settings/raw/RawGiveawaySettings';
import { SQL_TABLE_SCHEMA as MemberTableSchema } from '../types/settings/raw/RawMemberSettings';
import { SQL_TABLE_SCHEMA as ModerationTableSchema } from '../types/settings/raw/RawModerationSettings';
import { SQL_TABLE_SCHEMA as StarboardTableSchema } from '../types/settings/raw/RawStarboardSettings';
import { SQL_TABLE_SCHEMA as UserTableSchema } from '../types/settings/raw/RawUserSettings';

let initialized = false;
export async function run(provider: PostgresProvider) {
	if (initialized) return;
	initialized = true;

	await Promise.all([
		BannerSchema,
		CommandCounterSchema,
		GiveawayTableSchema,
		MemberTableSchema,
		ModerationTableSchema,
		StarboardTableSchema,
		UserTableSchema
	].map(schema => provider.run(schema)));
}
