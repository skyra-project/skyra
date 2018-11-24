import { R, RDatum } from 'rethinkdb-ts';
import { MODERATION } from './constants';

export class DatabaseInit {

	private static initialized = false;

	private static tables: [string, [string, (rows: RDatum) => RDatum[] | RDatum][]][] = [
		['oxford', []],
		['banners', []],
		['starboard', [
			['guildID', (rows) => rows('guildID')],
			['stars', (rows) => rows('stars')]
		]],
		['users', [
			['points', (rows) => rows('points')]
		]],
		['members', [
			['guildID', (rows) => rows('guildID')],
			['points', (rows) => rows('points')]
		]],
		['moderation', [
			['guildID', (rows) => rows('guildID')],
			['guild_case', (rows) => [rows(MODERATION.SCHEMA_KEYS.GUILD), rows(MODERATION.SCHEMA_KEYS.CASE)]],
			['guild_user', (rows) => [rows(MODERATION.SCHEMA_KEYS.GUILD), rows(MODERATION.SCHEMA_KEYS.USER)]]
		]],
		['polls', [
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
		await r.branch(r.tableList().contains(table), null, r.tableCreate(table)).run();
		await Promise.all(indexes.map(([index, value]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, value)).run().then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index)).run()
			)
		));
	}

}
