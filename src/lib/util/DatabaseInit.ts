import { R, RDatum } from 'rethinkdb-ts';
import { Databases } from '../types/constants/Constants';
import { MemberSettings } from '../types/settings/MemberSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { ModerationSchemaKeys } from './constants';

let initialized = false;
const tables: readonly [string, [string, (doc: RDatum) => RDatum[] | RDatum][]][] = [
	[Databases.Starboard, [
		['guildID', doc => doc('guildID')],
		['stars', doc => doc('stars')],
		['channel_message', doc => [doc('channelID'), doc('messageID')]]
	]],
	[Databases.Giveaway, [
		['guildID', doc => doc('guildID')]
	]],
	[Databases.Users, [
		['points', doc => doc(UserSettings.Points)]
	]],
	[Databases.Members, [
		['guildID', doc => doc('id').split('.').nth(0)],
		['points', doc => doc(MemberSettings.Points)]
	]],
	[Databases.Moderation, [
		['guildID', doc => doc(ModerationSchemaKeys.Guild)],
		['guild_case', doc => [doc(ModerationSchemaKeys.Guild), doc(ModerationSchemaKeys.Case)]],
		['guild_user', doc => [doc(ModerationSchemaKeys.Guild), doc(ModerationSchemaKeys.User)]]
	]],
	[Databases.Polls, [
		['guild', doc => doc('guildID')]
	]]
];

/**
 * Init the database
 * @param r The R
 */
export async function run(r: R): Promise < void> {
	if (initialized) return;
	initialized = true;
	await Promise.all(tables.map(ensureTable.bind(null, r)));
}

/**
 * Ensure that a table with all its indexes exist
 * @param r The R
 * @param table The table
 */
export async function ensureTable(r: R, [table, indexes]: [string, [string, (rows: RDatum) => RDatum[] | RDatum][]]): Promise<void> {
	await Promise.all(indexes.map(([index, value]) =>
		r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, value)).run().then(() =>
			r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index)).run())));
}
