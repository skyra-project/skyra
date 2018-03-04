const { RawEvent } = require('../index');
const EMOJI_WHITELIST = new Set(['⭐']);

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, {
			name: 'MESSAGE_REACTION_ADD'
		});
	}

	async run({ message, reaction, user }) { // eslint-disable-line
		// if (!guild.available) return;
		// if (guild.members.has(user.id)) guild.members.delete(user.id);
		// if (guild.security.hasRAID(user.id)) guild.security.raid.delete(user.id);
		// if (guild.configs.events.memberRemove) {
		// 	this._handleLog(guild, user).catch(error => this.client.emit('error', error));
		// 	this._handleMessage(guild, user).catch(error => this.client.emit('error', error));
		// }
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

		// Verify user
		const user = await this.client.users.fetch(data.user_id);

		// Verify message
		const message = await channel.messages.fetch(data.message_id);
		if (!message || !data.emoji) return false;

		// Verify reaction
		const reaction = message.reactions.add({
			emoji: data.emoji,
			count: 0,
			me: user.id === this.client.user.id
		});
		reaction._add(user);

		return { message, reaction, user };
	}

};
