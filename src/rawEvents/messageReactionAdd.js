/// <reference path="../index.d.ts" />
const { RawEvent, util: { resolveEmoji } } = require('../index');

module.exports = class extends RawEvent {

	/**
	 * 	MESSAGE_REACTION_ADD Packet
	 *  ###########################
	 * 	{
	 * 		user_id: 'id',
	 * 		message_id: 'id',
	 * 		emoji: {
	 * 			name: '😄',
	 * 			id: null,
	 * 			animated: false
	 * 		},
	 * 		channel_id: 'id',
	 * 		guild_id: 'id'
	 * 	}
	 */

	async run(data) {
		/** @type {SKYRA.SkyraTextChannel} */
		// @ts-ignore
		const channel = this.client.channels.get(data.channel_id);
		// @ts-ignore
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		const parsed = {
			channel,
			emoji: {
				animated: data.emoji.animated,
				id: data.emoji.id,
				managed: data.emoji.managed || null,
				name: data.emoji.name,
				requireColons: data.emoji.require_colons || null,
				roles: data.emoji.roles || null,
				user: (data.emoji.user && this.client.users.add(data.emoji.user)) || { id: data.user_id }
			},
			guild: channel.guild,
			messageID: data.message_id,
			userID: data.user_id
		};

		for (const llrc of this.client.llrCollectors)
			llrc.send(parsed, parsed.emoji.user);

		if (data.channel_id === channel.guild.settings.channels.roles)
			this.handleRoleChannel(parsed);
		else if (channel.guild.settings.starboard.channel !== parsed.channel.id && resolveEmoji(parsed.emoji) === channel.guild.settings.starboard.emoji)
			this.handleStarboard(parsed);
	}

	/**
	 * @param {SKYRA.ReactionData} parsed The parsed data
	 */
	async handleRoleChannel(parsed) {
		const { messageReaction } = parsed.guild.settings.roles;
		if (!messageReaction || messageReaction !== parsed.messageID) return;

		const emoji = resolveEmoji(parsed.emoji);
		if (!emoji) return;

		const roleEntry = parsed.guild.settings.roles.reactions.find(entry => entry.emoji === emoji);
		if (!roleEntry) return;

		try {
			const member = await parsed.guild.members.fetch(parsed.userID);
			if (!member.roles.has(roleEntry.role)) await member.roles.add(roleEntry.role);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

	/**
	 * @param {SKYRA.ReactionData} parsed The parsed data
	 */
	async handleStarboard(parsed) {
		try {
			const starboardSettings = parsed.guild.settings.starboard;
			if (!starboardSettings.channel || starboardSettings.ignoreChannels.includes(parsed.channel.id)) return;


			// Safeguard
			/** @type {SKYRA.SkyraTextChannel} */
			// @ts-ignore
			const starboardChannel = parsed.guild.channels.get(starboardSettings.channel);
			if (!starboardChannel || !starboardChannel.postable) {
				await parsed.guild.settings.reset('starboard.channel');
				return;
			}

			// Process the starboard
			const { starboard } = parsed.guild;
			const sMessage = await starboard.fetch(parsed.channel, parsed.messageID, parsed.userID);
			if (sMessage) await sMessage.add(parsed.userID);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

};
