const { MODERATION: { SCHEMA_KEYS } } = require('./constants');
let init = false;

module.exports = class DatabaseInit {

	public static async init(r) {
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

	public static async initOxford(r) {
		const TABLENAME = 'oxford';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	public static async initBanners(r) {
		const TABLENAME = 'banners';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	public static async initStarboard(r) {
		const TABLENAME = 'starboard';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['channel_message', [r.row('channelID'), r.row('messageID')]]
		]);
	}

	public static async initGlobalScores(r) {
		const TABLENAME = 'users';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['points', undefined]
		]);
	}

	public static async initLocalScores(r) {
		const TABLENAME = 'localScores';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guild_user', [r.row('guildID'), r.row('userID')]],
			['guildID', undefined],
			['count', undefined]
		]);
	}

	public static async initModeration(r) {
		const TABLENAME = 'moderation';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guildID', undefined],
			['guild_case', [r.row(SCHEMA_KEYS.GUILD), r.row(SCHEMA_KEYS.CASE)]],
			['guild_user', [r.row(SCHEMA_KEYS.GUILD), r.row(SCHEMA_KEYS.USER)]]
		]);
	}

	public static async ensureTable(r, table) {
		await r.branch(r.tableList().contains(table), null, r.tableCreate(table));
	}

	public static async ensureTableAndIndex(r, table, indexes) {
		await DatabaseInit.ensureTable(r, table);
		await Promise.all(indexes.map(([index, indexValue]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, indexValue)).then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index))
			)
		));
	}

};
