const Moderation = require('./Moderation');
let init = false;

module.exports = class DatabaseInit {

	static async init(r) {
		if (init) return;
		await Promise.all([
			DatabaseInit.initStarboard(r),
			DatabaseInit.initLocalScores(r),
			DatabaseInit.initModeration(r)
		]);
		init = true;
	}

	static async initStarboard(r) {
		const TABLENAME = 'starboard', INDEXNAME = 'guild_message';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row('guildID'), r.row('messageID')]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

	static async initLocalScores(r) {
		const TABLENAME = 'localScores', INDEXNAME = 'user_guild';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row('guildID'), r.row('userID')]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

	static async initModeration(r) {
		const TABLENAME = 'moderation', INDEXNAME = 'guild_case';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row(Moderation.schemaKeys.GUILD), r.row(Moderation.schemaKeys.CASE)]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

};
