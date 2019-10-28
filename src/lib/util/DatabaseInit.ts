import PostgresProvider from '../../providers/postgres';

import { SQL_TABLE_SCHEMA as BannerTableSchema } from '../types/settings/raw/RawBannerSettings';
import { SQL_TABLE_SCHEMA as ClientTableSchema } from '../types/settings/raw/RawClientSettings';
import { SQL_TABLE_SCHEMA as CommandCounterTableSchema } from '../types/settings/raw/RawCommandCounterSettings';
import { SQL_TABLE_SCHEMA as GiveawayTableSchema } from '../types/settings/raw/RawGiveawaySettings';
import { SQL_TABLE_SCHEMA as GuildTableSchema } from '../types/settings/raw/RawGuildSettings';
import { SQL_TABLE_SCHEMA as MemberTableSchema } from '../types/settings/raw/RawMemberSettings';
import { SQL_TABLE_SCHEMA as ModerationTableSchema } from '../types/settings/raw/RawModerationSettings';
import { SQL_TABLE_SCHEMA as StarboardTableSchema } from '../types/settings/raw/RawStarboardSettings';
import { SQL_TABLE_SCHEMA as UserTableSchema } from '../types/settings/raw/RawUserSettings';

let initialized = false;
export async function run(provider: PostgresProvider) {
	if (initialized) return;
	initialized = true;

	await Promise.all([
		['banners', BannerTableSchema],
		['clientStorage', ClientTableSchema],
		['command_counter', CommandCounterTableSchema],
		['giveaway', GiveawayTableSchema],
		['guilds', GuildTableSchema],
		['members', MemberTableSchema],
		['moderation', ModerationTableSchema],
		['starboard', StarboardTableSchema],
		['users', UserTableSchema]
	].map(([name, schema]) => provider.run(schema).catch(error => console.error(`Failed to create schema for ${name}:`, error))));
}
