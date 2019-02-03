import { RawEvent } from '../lib/structures/RawEvent';
import { WSMessageDelete } from '../lib/types/Discord';

export default class extends RawEvent {

	public async run(data: WSMessageDelete): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		guild.starboard.delete(`${data.channel_id}-${data.id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table('starboard')
				.get(`${data.channel_id}.${data.id}`)
				.delete({ returnChanges: true })
				.run();

			if (!results.deleted) return;

			const channel = guild.settings.get('starboard.channel') as string;
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

}
