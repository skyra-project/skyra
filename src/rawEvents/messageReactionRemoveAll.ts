
import { RawEvent } from '../index';

export default class extends RawEvent {


	/**
	 *	MESSAGE_REACTION_REMOVE_ALL Packet
	 *	##################################
	 *	{
	 *		message_id: '499172527575400458',
	 *		channel_id: '473443094759473172',
	 *		guild_id: '254360814063058944'
	 *	}
	 */

	async run(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		guild.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table('starboard')
				.getAll([data.channel_id, data.message_id], { index: 'channel_message' })
				.limit(1)
				.delete({ returnChanges: true })
				.run();

			if (!results.deleted) return;

			const { channel } = guild.settings.starboard;
			if (!channel) return;

			for (const change of results.changes) {
				const messageID = change.old_val.starMessageID;
				if (messageID) {
					// @ts-ignore
					this.client.api.channels(channel).messages(messageID)
						.delete({ reason: 'Starboard Management: Reactions Cleared' })
						.catch((error) => this.client.emit('apiError', error));
				}
			}
		} catch (error) {
			this.client.emit('wtf', error);
		}
	}

};
