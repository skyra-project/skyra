const { Task } = require('../index');
const { util: { binaryToID } } = require('discord.js');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30,
	EPOCH = 1420070400000,
	EMPTY = '0000100000000000000000';

const HEADER = `\u001B[39m\u001B[94m[CACHE CLEANUP]\u001B[39m\u001B[90m`;

/**
 * @since 3.0.0
 * @version 2.0.0
 * @extends {Task}
 */
module.exports = class MemorySweeper extends Task {

	async run() {
		const OLD_SNOWFLAKE = binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
		let presences = 0, guildMembers = 0, emojis = 0, lastMessage = 0, users = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			presences += guild.presences.size;
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.lastMessageID && member.lastMessageID < OLD_SNOWFLAKE) continue;
				guildMembers++;
				guild.members.delete(id);
			}

			// Clear emojis
			emojis += guild.emojis.size;
			guild.emojis.clear();
		}

		// Per-Channel sweeper
		for (const channel of this.client.channels.values()) {
			if (channel.lastMessageID) {
				channel.lastMessage = null;
				channel.lastMessageID = null;
				lastMessage++;
			}
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID < OLD_SNOWFLAKE) continue;
			user.lastMessage = null;
			user.lastMessageID = null;
			this.client.users.delete(user.id);
			lastMessage++;
			users++;
		}

		// Emit a log
		this.client.emit('verbose',
			`${HEADER} ${
				this.setColor(presences)} [Presence]s | ${
				this.setColor(guildMembers)} [GuildMember]s | ${
				this.setColor(users)} [User]s | ${
				this.setColor(emojis)} [Emoji]s | ${
				this.setColor(lastMessage)} [Last Message]s.`);
	}

	/**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {number}
	 */
	setColor(number) {
		const text = String(number).padStart(4, ' ');
		// Light Red color
		if (number > 1000) return `\u001B[39m\u001B[91m${text}\u001B[39m\u001B[90m`;
		// Light Yellow color
		if (number > 100) return `\u001B[39m\u001B[93m${text}\u001B[39m\u001B[90m`;
		// Green color
		return `\u001B[39m\u001B[32m${text}\u001B[39m\u001B[90m`;
	}

};
