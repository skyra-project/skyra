const RethinkDB = require('../../../providers/rethink');

class MemberProfile {

	constructor(guild, member, { score = 0 } = {}) {
		Object.defineProperty(this, 'guild', { value: guild });
		Object.defineProperty(this, 'id', { value: member });
		this.score = score;
	}

	async update(score) {
		await RethinkDB.updateArrayByID('localScores', this.guild, 'scores', this.id, { score });
		this.score = score;
		return this.score;
	}

	toJSON() {
		return {
			id: this.id,
			guild: this.guild,
			score: this.score
		};
	}

}

module.exports = MemberProfile;
