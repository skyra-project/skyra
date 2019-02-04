
import { Task } from 'klasa';
import { R } from 'rethinkdb-ts';
import { Events } from '../lib/types/Enums';

export default class extends Task {

	public async run(): Promise<void> {
		this.disable();
		const r = this.client.providers.default.db;
		const [users, members] = await Promise.all([
			this.sweepUserProfiles(r),
			this.sweepMemberProfiles(r)
		]);
		this.client.emit(Events.Verbose, `[DB:SWEEP] Swept ${users.toLocaleString()} [UserProfile]s and ${members.toLocaleString()} [MemberProfile]s`);
		this.enable();
	}

	public async sweepUserProfiles(r: R): Promise<number> {
		return (await r.table('users').filter(
			r.row('points').le(25)
				.and(r.row.hasFields('color', 'reputation', 'money', 'bannerList').not())
				.and(r.row('bannerList').default([]).count().eq(0))
		).delete().run()).deleted;
	}

	public async sweepMemberProfiles(r: R): Promise<number> {
		return (await r.table('localScores').filter(
			r.row('count').le(25)
		).delete().run()).deleted;
	}

}
