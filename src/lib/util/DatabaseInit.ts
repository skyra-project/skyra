import { R, RDatum } from 'rethinkdb-ts';
import { MODERATION } from './constants';

let init = false;

export class DatabaseInit {

	/**
	 * Init the database
	 * @param r The R
	 */
	public static async init(r: R): Promise<void> {
		if (init) return;
		await Promise.all([
			DatabaseInit.initOxford(r),
			DatabaseInit.initBanners(r),
			DatabaseInit.initStarboard(r),
			DatabaseInit.initGlobalScores(r),
			DatabaseInit.initLocalScores(r),
			DatabaseInit.initModeration(r)
		]);
		init = true;
	}

	/**
	 * Init the Oxford table
	 * @param r The R
	 */
	public static async initOxford(r: R): Promise<void> {
		const TABLENAME = 'oxford';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	/**
	 * Init the banners table
	 * @param r The R
	 */
	public static async initBanners(r: R): Promise<void> {
		const TABLENAME = 'banners';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	/**
	 * Init the starboard table
	 * @param r The R
	 */
	public static async initStarboard(r: R): Promise<void> {
		const TABLENAME = 'starboard';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['channel_message', (rows) => [rows('channelID'), rows('messageID')]],
			['guildID', (rows) => rows('guildID')],
			['stars', (rows) => rows('stars')]
		]);
	}

	/**
	 * Init the users table
	 * @param r The R
	 */
	public static async initGlobalScores(r: R): Promise<void> {
		const TABLENAME = 'users';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['points', (rows) => rows('points')]
		]);
	}

	/**
	 * Init the members table
	 * @param r The R
	 */
	public static async initLocalScores(r: R): Promise<void> {
		const TABLENAME = 'localScores';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guild_user', (rows) => [rows('guildID'), rows('userID')]],
			['guildID', (rows) => rows('guildID')],
			['count', (rows) => rows('count')]
		]);
	}

	/**
	 * Init the moderation table
	 * @param r The R
	 */
	public static async initModeration(r: R): Promise<void> {
		const TABLENAME = 'moderation';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guildID', (rows) => rows('guildID')],
			['guild_case', (rows) => [rows(MODERATION.SCHEMA_KEYS.GUILD), rows(MODERATION.SCHEMA_KEYS.CASE)]],
			['guild_user', (rows) => [rows(MODERATION.SCHEMA_KEYS.GUILD), rows(MODERATION.SCHEMA_KEYS.USER)]]
		]);
	}

	/**
	 * Ensure the table exists
	 * @param r The R
	 * @param table The table
	 */
	public static async ensureTable(r: R, table: string): Promise<void> {
		await r.branch(r.tableList().contains(table), null, r.tableCreate(table)).run();
	}

	/**
	 * Ensure the table exists
	 * @param r The R
	 * @param table The table
	 * @param indexes The indexes to create
	 */
	public static async ensureTableAndIndex(r: R, table: string, indexes: [string, (rows: RDatum) => RDatum[] | RDatum][]): Promise<void> {
		await DatabaseInit.ensureTable(r, table);
		await Promise.all(indexes.map(([index, indexValue]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, indexValue)).run().then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index)).run()
			)
		));
	}

}
