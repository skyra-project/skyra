const { Task } = require('../index');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30;

module.exports = class extends Task {

	async run() {
		const now = Date.now(), LIMIT = now - THRESHOLD;
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.lastMessage && member.lastMessage.createdTimestamp < LIMIT) continue;
				guild.members.delete(id);
			}

			// Clear emojis
			guild.emojis.clear();
		}
		this.client.emit('verbose', 'Cleared presences, members and emojis.');
	}

};
