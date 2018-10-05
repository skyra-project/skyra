/// <reference path="../../rebirthdb.d.ts" />
const { MODERATION: { SCHEMA_KEYS } } = require('./constants');
let init = false;

module.exports = class DatabaseInit {

	/**
	 * Init the database
	 * @param {RebirthDBTS.R} r The R
	 */
	static async init(r) {
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
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initOxford(r) {
		const TABLENAME = 'oxford';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	/**
	 * Init the banners table
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initBanners(r) {
		const TABLENAME = 'banners';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	/**
	 * Init the starboard table
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initStarboard(r) {
		const TABLENAME = 'starboard';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['channel_message', [r.row('channelID'), r.row('messageID')]]
		]);
	}

	/**
	 * Init the users table
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initGlobalScores(r) {
		const TABLENAME = 'users';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['points', undefined]
		]);
	}

	/**
	 * Init the members table
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initLocalScores(r) {
		const TABLENAME = 'localScores';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guild_user', [r.row('guildID'), r.row('userID')]],
			['guildID', undefined],
			['count', undefined]
		]);
	}

	/**
	 * Init the moderation table
	 * @param {RebirthDBTS.R} r The R
	 */
	static async initModeration(r) {
		const TABLENAME = 'moderation';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guildID', undefined],
			['guild_case', [r.row(SCHEMA_KEYS.GUILD), r.row(SCHEMA_KEYS.CASE)]],
			['guild_user', [r.row(SCHEMA_KEYS.GUILD), r.row(SCHEMA_KEYS.USER)]]
		]);
	}

	/**
	 * Ensure the table exists
	 * @param {RebirthDBTS.R} r The R
	 * @param {string} table The table
	 */
	static async ensureTable(r, table) {
		await r.branch(r.tableList().contains(table), null, r.tableCreate(table)).run();
	}

	/**
	 * Ensure the table exists
	 * @param {RebirthDBTS.R} r The R
	 * @param {string} table The table
	 * @param {Array<Array<*>>} indexes The indexes to create
	 */
	static async ensureTableAndIndex(r, table, indexes) {
		await DatabaseInit.ensureTable(r, table);
		await Promise.all(indexes.map(([index, indexValue]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, indexValue)).run().then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index))
			)
		));
	}

};
