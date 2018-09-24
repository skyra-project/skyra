// @ts-nocheck
const { Extendable, User } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [User] });
	}

	async fetchRank() {
		const list = await this.client.leaderboard.getUsers();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}

};
