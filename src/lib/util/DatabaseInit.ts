import { R, RDatum } from 'rethinkdb-ts';
import { Databases } from '../types/constants/Constants';
import { MemberSettings } from '../types/settings/MemberSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { ModerationSchemaKeys } from './constants';

export class DatabaseInit {

	private static initialized = false;

	private static readonly tables: [string, [string, (doc: RDatum) => RDatum[] | RDatum][]][] = [
		[Databases.Starboard, [
			['guildID', (doc) => doc('guildID')],
			['stars', (doc) => doc('stars')]
		]],
		[Databases.Users, [
			['points', (doc) => doc(UserSettings.Points)]
		]],
		[Databases.Members, [
			['guildID', (doc) => doc('id').split('.').nth(0)],
			['points', (doc) => doc(MemberSettings.Points)]
		]],
		[Databases.Moderation, [
			['guildID', (doc) => doc(ModerationSchemaKeys.Guild)],
			['guild_case', (doc) => [doc(ModerationSchemaKeys.Guild), doc(ModerationSchemaKeys.Case)]],
			['guild_user', (doc) => [doc(ModerationSchemaKeys.Guild), doc(ModerationSchemaKeys.User)]]
		]],
		[Databases.Polls, [
			['guild', (doc) => doc('guildID')]
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
