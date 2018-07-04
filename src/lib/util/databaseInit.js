const Moderation = require('./Moderation');
let init = false;

module.exports = class DatabaseInit {

	static async init(r) {
		if (init) return;
		await Promise.all([
			DatabaseInit.initStarboard(r),
			DatabaseInit.initLocalScores(r),
			DatabaseInit.initModeration(r),
			DatabaseInit.initBanners(r)
		]);
		init = true;
	}

	static async initBanners(r) {
		const TABLENAME = 'banners';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
	}

	static async initStarboard(r) {
		const TABLENAME = 'starboard', INDEXNAME = 'channel_message';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row('channelID'), r.row('messageID')]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

	static async initLocalScores(r) {
		const TABLENAME = 'localScores', INDEXNAME = 'guild_user';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row('guildID'), r.row('userID')]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

	static async initModeration(r) {
		const TABLENAME = 'moderation', INDEXNAME_CASE = 'guild_case', INDEXNAME_USER = 'guild_user';

		await r.branch(r.tableList().contains(TABLENAME), null, r.tableCreate(TABLENAME));

		// Create tables
		await Promise.all([
			r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME_CASE), null,
				r.table(TABLENAME).indexCreate(INDEXNAME_CASE, [r.row(Moderation.schemaKeys.GUILD), r.row(Moderation.schemaKeys.CASE)])),
			r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME_USER), null,
				r.table(TABLENAME).indexCreate(INDEXNAME_USER, [r.row(Moderation.schemaKeys.GUILD), r.row(Moderation.schemaKeys.USER)]))
		]);

		// Create indexes
		await Promise.all([
			r.branch(r.table(TABLENAME).indexStatus(INDEXNAME_CASE).nth(0)('ready'), null,
				r.table(TABLENAME).indexWait(INDEXNAME_CASE)),
			r.branch(r.table(TABLENAME).indexStatus(INDEXNAME_USER).nth(0)('ready'), null,
				r.table(TABLENAME).indexWait(INDEXNAME_USER))
		]);
	}

};
