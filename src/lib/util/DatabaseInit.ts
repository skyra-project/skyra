import { R, RDatum } from 'rethinkdb-ts';
import { Databases } from '../types/constants/Constants';
import { MemberSettings } from '../types/settings/MemberSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { ModerationSchemaKeys } from './constants';

export class DatabaseInit {

	private static initialized = false;

	private static readonly tables: [string, [string, (rows: RDatum) => RDatum[] | RDatum][]][] = [
		[Databases.Starboard, [
			['guildID', (rows) => rows('guildID')],
			['stars', (rows) => rows('stars')]
		]],
		[Databases.Users, [
			['points', (rows) => rows(UserSettings.Points)]
		]],
		[Databases.Members, [
			['guildID', (rows) => rows('guildID')],
			['points', (rows) => rows(MemberSettings.Points)]
		]],
		[Databases.Moderation, [
			['guildID', (rows) => rows(ModerationSchemaKeys.Guild)],
			['guild_case', (rows) => [rows(ModerationSchemaKeys.Guild), rows(ModerationSchemaKeys.Case)]],
			['guild_user', (rows) => [rows(ModerationSchemaKeys.Guild), rows(ModerationSchemaKeys.User)]]
		]],
		[Databases.Polls, [
			['guild', (rows) => rows('guildID')]
		]]
	];

	/**
	 * Init the database
	 * @param r The R
	 */
	public static async run(r: R): Promise<void> {
		if (this.initialized) return;
		this.initialized = true;
		await Promise.all(this.tables.map(this.ensureTable.bind(null, r)));
	}

	/**
	 * Ensure that a table with all its indexes exist
	 * @param r The R
	 * @param table The table
	 */
	public static async ensureTable(r: R, [table, indexes]: [string, [string, (rows: RDatum) => RDatum[] | RDatum][]]): Promise<void> {
		await Promise.all(indexes.map(([index, value]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, value)).run().then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index)).run()
			)
		));
	}

}
