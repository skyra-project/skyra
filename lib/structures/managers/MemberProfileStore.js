const MemberProfile = require('./MemberProfile');
const RethinkDB = require('../../../providers/rethink');
const { Collection } = require('discord.js');

class MemberProfileStore extends Collection {

	constructor(client, guild) {
		super();

		Object.defineProperty(this, 'client', { value: client });
		Object.defineProperty(this, 'guild', { value: guild });
	}

	get(member) {
		return super.get(member) || this.createMember(member);
	}

	addMember(member, data) {
		const localMember = new MemberProfile(this.guild, member, data);
		super.set(localMember.id, localMember);
		return localMember;
	}

	async createMember(member) {
		this.client.emit('log', `LOCALSCORES  | Created ${member} | ${this.guild}`, 'verbose');
		const localMember = new MemberProfile(this.guild, member, {});
		await RethinkDB.append('localScores', this.guild, 'scores', localMember.toJSON())
			.then(() => super.set(localMember.id, localMember));
		return localMember;
	}

	async removeMember(member) {
		this.client.emit('log', `LOCALSCORES  | Removed ${member} | ${this.guild}`, 'warn');
		await RethinkDB.removeFromArrayByID('localScores', this.guild, 'scores', member);
		return super.delete(member);
	}

	async create() {
		this.client.emit('log', `LOCALSCORES  | Created ${this.guild}`, 'verbose');
		await RethinkDB.create('localScores', { id: this.guild, scores: [] });
		return this;
	}

}

module.exports = MemberProfileStore;
