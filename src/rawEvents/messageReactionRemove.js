/// <reference path="../index.d.ts" />
const { RawEvent, util: { resolveEmoji } } = require('../index');

module.exports = class extends RawEvent {

	/**
	 *	MESSAGE_REACTION_REMOVE Packet
	 *	##############################
	 *	{
	 *		user_id: 'id',
	 *		message_id: 'id',
	 *		emoji: {
	 *			name: '😄',
	 *			id: null,
	 *			animated: false
	 *		},
	 *		channel_id: 'id',
	 *		guild_id: 'id'
	 *	}
	 */

	async run(data) { // eslint-disable-line camelcase
		// Verify channel
		/** @type {SKYRA.SkyraTextChannel} */
		// @ts-ignore
		const channel = this.client.channels.get(data.channel_id);
		// @ts-ignore
		if (!channel || channel.type !== 'text' || !channel.readable) return false;

		if (channel.id === channel.guild.settings.channels.roles)
			this.handleRoleChannel(channel, data);

		return false;
	}

	async handleRoleChannel(channel, data) {
		const { messageReaction } = channel.guild.settings.roles;
		if (!messageReaction || messageReaction !== data.message_id) return;

		const parsed = resolveEmoji(data.emoji);
		if (!parsed) return;

		const roleEntry = channel.guild.settings.roles.reactions.find(entry => entry.emoji === parsed);
		if (!roleEntry) return;

		try {
			const member = await channel.guild.members.fetch(data.user_id);
			if (member.roles.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

};
