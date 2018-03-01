const { Task } = require('../index');

module.exports = class extends Task {

	async run() {
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			guild.presences.clear();

			// Clear members
			const { me } = guild;
			guild.members.clear();
			if (me) guild.members.set(me.id, me);

			// Clear emojis
			guild.emojis.clear();
		}
		this.client.emit('verbose', 'Cleared presences, members and emojis.');
	}

};
