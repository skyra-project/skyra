const { Task } = require('../index');
const { util: { binaryToID } } = require('discord.js');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30,
	EPOCH = 1420070400000,
	EMPTY = '0000100000000000000000';

module.exports = class extends Task {

	async run() {
		const OLD_SNOWFLAKE = binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.lastMessageID && member.lastMessageID < OLD_SNOWFLAKE) continue;
				guild.members.delete(id);
			}

			// Clear emojis
			guild.emojis.clear();
		}

		// Per-Channel sweeper
		for (const channel of this.client.channels.values()) {
			if (channel.lastMessageID) {
				channel.lastMessage = null;
				channel.lastMessageID = null;
			}
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID < OLD_SNOWFLAKE) continue;
			user.lastMessage = null;
			user.lastMessageID = null;
			this.client.users.delete(user.id);
		}

		// Emit a log
		this.client.emit('verbose', 'Cleared [Presence]s, [GuildMember]s, [Emoji]s, and [Last Message]s.');
	}

};
