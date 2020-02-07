import PostgresProvider from 'src/providers/postgres';

import { SQL_TABLE_SCHEMA as BannerTableSchema } from '@lib/types/settings/raw/RawBannerSettings';
import { SQL_TABLE_SCHEMA as ClientTableSchema } from '@lib/types/settings/raw/RawClientSettings';
import { SQL_TABLE_SCHEMA as CommandCounterTableSchema } from '@lib/types/settings/raw/RawCommandCounterSettings';
import { SQL_TABLE_SCHEMA as DashboardUserTableSchema } from '@lib/types/settings/raw/RawDashboardUserSettings';
import { SQL_TABLE_SCHEMA as GiveawayTableSchema } from '@lib/types/settings/raw/RawGiveawaySettings';
import { SQL_TABLE_SCHEMA as GuildTableSchema } from '@lib/types/settings/raw/RawGuildSettings';
import { SQL_TABLE_SCHEMA as MemberTableSchema } from '@lib/types/settings/raw/RawMemberSettings';
import { SQL_TABLE_SCHEMA as ModerationTableSchema } from '@lib/types/settings/raw/RawModerationSettings';
import { SQL_TABLE_SCHEMA as StarboardTableSchema } from '@lib/types/settings/raw/RawStarboardSettings';
import { SQL_TABLE_SCHEMA as TwitchStreamSubscrioptionTableSchema } from '@lib/types/settings/raw/RawTwitchStreamSubscriptionSettings';
import { SQL_TABLE_SCHEMA as UserTableSchema } from '@lib/types/settings/raw/RawUserSettings';
import { SQL_TABLE_SCHEMA as GameTableSchema } from '@lib/types/settings/raw/RawGameSettings';

let initialized = false;
export async function run(provider: PostgresProvider) {
	if (initialized) return;
	initialized = true;

	const tables = [
		['banners', BannerTableSchema],
		['clientStorage', ClientTableSchema],
		['command_counter', CommandCounterTableSchema],
		['giveaway', GiveawayTableSchema],
		['guilds', GuildTableSchema],
		['members', MemberTableSchema],
		['moderation', ModerationTableSchema],
		['starboard', StarboardTableSchema],
		['twitch_stream_subscriptions', TwitchStreamSubscrioptionTableSchema],
		['users', UserTableSchema],
		['dashboard_user', DashboardUserTableSchema],
		['rpg_game', GameTableSchema]
	] as const;

	try {
		const schemas = tables.map(([name, schema]) => `-- ${name}\n${schema}`).join('\n');
		await provider.run(/* sql */`
			BEGIN;
			${schemas}
			COMMIT;
		`);
	} catch (error) {
		provider.client.console.error(`Failed to create schema:`, error);
	}
}
