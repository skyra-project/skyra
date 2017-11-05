const MemberProfileStore = require('./MemberProfileStore');
const RethinkDB = require('../../../providers/rethink');
const { Collection } = require('discord.js');

class GuildMemberProfileStore extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });
	}

	get(guild) {
		return super.get(guild) || new MemberProfileStore(this.client, guild).create().then((localManager) => {
			super.set(guild, localManager);
			return localManager;
		});
	}

	sorted(guild) {
		return this.get(guild).sort((x, y) => +(x.score < y.score) || +(x.score === y.score) - 1);
	}

	getMember(guild, member) {
		const data = this.get(guild);
		if (data instanceof Promise) {
			return data.then(local => local.createMember(member));
		}
		return data.get(member);
	}

	set(id) {
		const localManager = new MemberProfileStore(this.client, id);
		super.set(id, localManager);
		return localManager;
	}

	async delete(guild) {
		this.client.emit('log', `LOCALSCORES | Deleted ${this.guild}`, 'warn');
		await RethinkDB.delete('localScores', guild);
		return super.delete(guild);
	}

	all() {
		return this;
	}

}

module.exports = GuildMemberProfileStore;
