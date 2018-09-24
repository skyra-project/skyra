const { RawEvent, constants: { CONNECT_FOUR }, util: { resolveEmoji } } = require('../index');
const { DiscordAPIError } = require('discord.js');
const CONNECT_FOUR_WHITELIST = new Set(CONNECT_FOUR.REACTIONS);

module.exports = class extends RawEvent {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'MESSAGE_REACTION_ADD' });
	}

	async run({ message, reaction, user }) { // eslint-disable-line
		// Unfinished
	}

	// 	{ user_id: 'id',
	// 	  message_id: 'id',
	// 	  emoji: { name: '😄', id: null, animated: false },
	// 	  channel_id: 'id' }

	async process(data) {
		// Verify channel
		const channel = this.client.channels.get(data.channel_id);
		if (!channel || channel.type !== 'text' || !channel.readable) return false;

		if (channel.id === channel.guild.settings.channels.roles)
			this._handleRoleChannel(channel.guild, data.emoji, data.user_id, data.message_id);

		// The ConnectFour does not need more data than this
		if (CONNECT_FOUR_WHITELIST.has(data.emoji.name)) {
			this._handleConnectFour(channel, data.message_id, data.emoji.name, data.user_id);
			return false;
		}

		if (channel.guild.settings.starboard.channel !== channel.id && resolveEmoji(data.emoji.name) === channel.guild.settings.starboard.emoji) {
			this._handleStarboard(channel, data.message_id, data.user_id);
			return false;
		}

		return false;

		// // Verify user
		// const user = await this.client.users.fetch(data.user_id);

		// // Verify message
		// const message = await channel.messages.fetch(data.message_id);
		// if (!message || !data.emoji) return false;

		// // Verify reaction
		// const reaction = message.reactions.add({
		// 	emoji: data.emoji,
		// 	count: 0,
		// 	me: user.id === this.client.user.id
		// });
		// reaction._add(user);

		// return { message, reaction, user };
	}

	async _handleRoleChannel(guild, emoji, userID, messageID) {
		const { messageReaction } = guild.settings.roles;
		if (!messageReaction || messageReaction !== messageID) return;

		const parsed = resolveEmoji(emoji.id ? `${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}` : emoji.name);
		const roleEntry = guild.settings.roles.reactions.find(entry => entry.emoji === parsed);
		if (!roleEntry) return;

		try {
			const member = await guild.members.fetch(userID);
			if (member.roles.has(roleEntry.role)) return;
			await member.roles.add(roleEntry.role);
		} catch (error) {
			if (error instanceof DiscordAPIError) Error.captureStackTrace(error);
			this.client.emit('apiError', error);
		}
	}

	async _handleStarboard(channel, messageID, userID) {
		try {
			const starboardSettings = channel.guild.settings.starboard;
			if (!starboardSettings.channel || starboardSettings.ignoreChannels.includes(channel.id)) return;

			// Safeguard
			const starboardChannel = channel.guild.channels.get(starboardSettings.channel);
			if (!starboardChannel || !starboardChannel.postable) {
				await channel.guild.settings.reset('starboard.channel');
				return;
			}

			// Process the starboard
			const { starboard } = channel.guild;
			const sMessage = await starboard.fetch(channel, messageID, userID);
			if (sMessage) await sMessage.add(userID);
		} catch (error) {
			if (error instanceof DiscordAPIError) Error.captureStackTrace(error);
			this.client.emit('apiError', error);
		}
	}

	_handleConnectFour(channel, messageID, emoji, userID) {
		const game = this.client.connectFour.matches.get(channel.id);
		if (game && game.message && game.message.id === messageID) game.send(emoji, userID);
	}

};
