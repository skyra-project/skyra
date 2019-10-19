import PostgresProvider from '../../providers/postgres';

import { SQL_TABLE_SCHEMA as GiveawayTableSchema } from '../types/settings/raw/RawGiveawaySettings';
import { SQL_TABLE_SCHEMA as MemberTableSchema } from '../types/settings/raw/RawMemberSettings';
import { SQL_TABLE_SCHEMA as ModerationTableSchema } from '../types/settings/raw/RawModerationSettings';
import { SQL_TABLE_SCHEMA as StarboardTableSchema } from '../types/settings/raw/RawStarboardSettings';
import { SQL_TABLE_SCHEMA as UserTableSchema } from '../types/settings/raw/RawUserSettings';

let initialized = false;
export async function run(provider: PostgresProvider) {
	if (initialized) return;
	initialized = true;

	const schemas = [GiveawayTableSchema, MemberTableSchema, ModerationTableSchema, StarboardTableSchema, UserTableSchema];
	const queries = schemas.map(schema => provider.run(schema));
	await Promise.all(queries);
}
