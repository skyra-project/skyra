const Moderation = require('./Moderation');
let init = false;

module.exports = class DatabaseInit {

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

	static async initOxford(r) {
		const TABLENAME = 'oxford';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	static async initBanners(r) {
		const TABLENAME = 'banners';

		await DatabaseInit.ensureTable(r, TABLENAME);
	}

	static async initStarboard(r) {
		const TABLENAME = 'starboard';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['channel_message', [r.row('channelID'), r.row('messageID')]]
		]);
	}

	static async initGlobalScores(r) {
		const TABLENAME = 'users';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['points', undefined]
		]);
	}

	static async initLocalScores(r) {
		const TABLENAME = 'localScores';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guild_user', [r.row('guildID'), r.row('userID')]],
			['guildID', undefined],
			['count', undefined]
		]);
	}

	static async initModeration(r) {
		const TABLENAME = 'moderation';

		await DatabaseInit.ensureTableAndIndex(r, TABLENAME, [
			['guild_case', [r.row(Moderation.schemaKeys.GUILD), r.row(Moderation.schemaKeys.CASE)]],
			['guild_user', [r.row(Moderation.schemaKeys.GUILD), r.row(Moderation.schemaKeys.USER)]]
		]);
	}

	static async ensureTable(r, table) {
		await r.branch(r.tableList().contains(table), null, r.tableCreate(table));
	}

	static async ensureTableAndIndex(r, table, indexes) {
		await DatabaseInit.ensureTable(r, table);
		await Promise.all(indexes.map(([index, indexValue]) =>
			r.branch(r.table(table).indexList().contains(index), null, r.table(table).indexCreate(index, indexValue)).then(() =>
				r.branch(r.table(table).indexStatus(index).nth(0)('ready'), null, r.table(table).indexWait(index))
			)
		));
	}

};
