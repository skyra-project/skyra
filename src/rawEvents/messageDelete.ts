
import { RawEvent } from '../index';

export default class extends RawEvent {

	/**
	 *	MESSAGE_DELETE Packet
	 *	#####################
	 *	{
	 *		id: 'id',
  	 *		channel_id: 'id',
	 *		guild_id: 'id'
	 *	}
	 */

	async run(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		guild.starboard.delete(`${data.channel_id}-${data.id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table('starboard')
				.getAll([data.channel_id, data.id], { index: 'channel_message' })
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
						.delete({ reason: 'Starboard Management: Message Deleted' })
						.catch((error) => this.client.emit('apiError', error));
				}
			}
		} catch (error) {
			this.client.emit('wtf', error);
		}
	}

};
