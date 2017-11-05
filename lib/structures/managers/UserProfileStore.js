const { Collection } = require('discord.js');

const UserProfile = require('./UserProfile');
const RethinkDB = require('../../../providers/rethink');

class SocialGlobalManager extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });
	}

	get(id) {
		return super.get(id) || this.addUser(id);
	}

	set(id, data) {
		const globalUser = new UserProfile(id, data);
		super.set(id, globalUser);
		return globalUser;
	}

	sorted(property = 'points') {
		return this.sort((x, y) => +(x[property] < y[property]) || +(x[property] === y[property]) - 1);
	}

	all() {
		return this;
	}

	async addUser(id) {
		this.client.emit('log', `GLOBALSCORES | Created ${id}`, 'verbose');
		const globalUser = new UserProfile(id, {});
		await RethinkDB.create('users', { id });
		super.set(id, globalUser);
		return globalUser;
	}

	async delete(id) {
		this.client.emit('log', `GLOBALSCORES | Deleted ${id}`, 'warn');
		await RethinkDB.delete('users', id);
		return super.delete(id);
	}

}

module.exports = SocialGlobalManager;
