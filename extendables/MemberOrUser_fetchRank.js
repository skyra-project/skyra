const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'fetchRank',
			appliesTo: ['GuildMember', 'User']
		});
	}

	async extend() {
		const isMember = this instanceof GuildMember;
		const list = await (isMember
			? this.client.leaderboard.getMembers(this.guild.id)
			: this.client.leaderboard.getUsers());

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = isMember ? this.user.username : this.username;
		return rank.position;
	}

};
