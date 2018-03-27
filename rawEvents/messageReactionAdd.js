const { RawEvent, constants: { CONNECT_FOUR } } = require('../index');
const EMOJI_WHITELIST = new Set(['⭐', ...CONNECT_FOUR.REACTIONS]);
const CONNECT_FOUR_WHITELIST = new Set(CONNECT_FOUR.REACTIONS);

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'MESSAGE_REACTION_ADD' });
		this.TEMP_CACHE = new Map();
	}

	async run({ message, reaction, user }) { // eslint-disable-line
		// Unfinished
	}

	// 	{ user_id: 'id',
	// 	  message_id: 'id',
	// 	  emoji: { name: '😄', id: null, animated: false },
	// 	  channel_id: 'id' }

	async process(data) {
		if (!EMOJI_WHITELIST.has(data.emoji.name)) return false;
		// Verify channel
		const channel = this.client.channels.get(data.channel_id);
		if (!channel || channel.type !== 'text' || !channel.readable) return false;

		// The ConnectFour does not need more data than this
		if (CONNECT_FOUR_WHITELIST.has(data.emoji.name)) {
			this._handleConnectFour(channel, data.message_id, data.emoji.name, data.user_id);
			return false;
		}

		if (data.emoji.name === '⭐') {
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

	async _handleStarboard(channel, messageID, userID) {
		const starboardConfigs = channel.guild.configs.starboard;
		if (!starboardConfigs.channel || starboardConfigs.ignoreChannels.includes(channel.id)) return;
		const { starboard } = channel.guild;
		const sMessage = await starboard.fetch(channel, messageID);
		await sMessage.add(userID);
	}

	_handleConnectFour(channel, messageID, emoji, userID) {
		const game = this.client.connectFour.matches.get(channel.id);
		if (game && game.message && game.message.id === messageID) game.send(emoji, userID);
	}

};
