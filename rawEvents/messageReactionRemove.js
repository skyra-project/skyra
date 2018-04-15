const { RawEvent } = require('../index');
const { DiscordAPIError } = require('discord.js');

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'MESSAGE_REACTION_REMOVE' });
		this.TEMP_CACHE = new Map();
	}

	// 	{ user_id: 'id',
	// 	  message_id: 'id',
	// 	  emoji: { name: '😄', id: null, animated: false },
	// 	  channel_id: 'id' }

	async process({ user_id, channel_id, message_id, emoji }) { // eslint-disable-line camelcase
		// Verify channel
		const channel = this.client.channels.get(channel_id);
		if (!channel || channel.type !== 'text' || !channel.readable) return false;

		if (channel.id === channel.guild.configs.channels.roles) {
			this._handleRoleChannel(channel.guild, emoji, user_id, message_id);
		}

		return false;
	}

	async _handleRoleChannel(guild, emoji, userID, messageID) {
		const { messageReaction } = guild.configs.roles;
		if (!messageReaction || messageReaction !== messageID) return;

		const roleEntry = guild.configs.roles.reactions.find(entry => entry.emoji === emoji.name);
		if (!roleEntry) return;

		try {
			const member = await guild.members.fetch(userID);
			if (!member.roles.has(roleEntry.role)) return;
			await member.roles.remove(roleEntry.role);
		} catch (error) {
			if (error instanceof DiscordAPIError) Error.captureStackTrace(error);
			this.client.emit('error', error);
		}
	}

};
