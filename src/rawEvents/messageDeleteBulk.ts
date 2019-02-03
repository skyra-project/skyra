import { RawEvent } from '../lib/structures/RawEvent';
import { WSMessageDeleteBulk } from '../lib/types/Discord';

export default class extends RawEvent {

	public async run(data: WSMessageDeleteBulk): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		for (const id of data.ids) guild.starboard.delete(`${data.channel_id}-${id}`);

		// Delete entries from starboard if it exists
		try {
			// @ts-ignore
			const results = await this.client.providers.default.db
				.table('starboard')
				.getAll(...data.ids.map((id) => [data.channel_id, id]))
				.delete({ returnChanges: true })
				.run();

			if (!results.deleted) return;

			const channel = guild.settings.get('starboard.channel');
			if (!channel) return;

			const messageSnowflakes = results.changes
				.map((change) => change.old_val.starMessageID)
				.filter((v) => v);

			if (messageSnowflakes.length === 0) return;
			if (messageSnowflakes.length === 1) {
				// @ts-ignore
				this.client.api.channels(channel).messages(messageSnowflakes[0])
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error) => this.client.emit('apiError', error));
				return;
			}
			// @ts-ignore
			this.client.api.channels[channel].messages['bulk-delete']
				.post({ data: { messages: messageSnowflakes }, reason: 'Starboard Management: Message Deleted' })
				.catch((error) => this.client.emit('apiError', error));
		} catch (error) {
			this.client.emit('wtf', error);
		}
	}

}
