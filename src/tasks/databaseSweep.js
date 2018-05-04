const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		this.disable();
		const r = this.client.providers.default.db;
		const [users, members] = await Promise.all([
			this.sweepUserProfiles(r),
			this.sweepMemberProfiles(r)
		]);
		this.client.emit('verbose', `[DB:SWEEP] Swept ${users.toLocaleString()} [UserProfile]s and ${members.toLocaleString()} [MemberProfile]s`);
		this.enable();
	}

	async sweepUserProfiles(r) {
		return (await r.table('users').filter(
			r.row('points').le(25)
				.and(r.row.hasFields(['color', 'reputation', 'money', 'bannerList']).not())
				.and(r.row('bannerList').default([]).count().eq(0))
		).delete()).deleted;
	}

	async sweepMemberProfiles(r) {
		return (await r.table('localScores').filter(
			r.row('count').le(25)
		).delete()).deleted;
	}

};
