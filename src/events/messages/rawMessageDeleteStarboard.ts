import { DbSet, GuildSettings } from '@lib/database';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { api } from '@utils/Models/Api';
import { GatewayMessageDeleteDispatch } from 'discord-api-types/v6';
import { DiscordAPIError, Guild } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.RawMessageDelete })
export default class extends Event {
	public async run(guild: Guild, data: GatewayMessageDeleteDispatch['d']) {
		guild.starboard.delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = await DbSet.connect();
			const results = await starboards
				.createQueryBuilder()
				.delete()
				.where('guild_id = :guild', { guild: data.guild_id })
				.andWhere('message_id = :message', { message: data.id })
				.returning('*')
				.execute();

			if (results.affected === 0) return;
			const [result] = results.raw;

			// Get channel
			const channel = await guild.readSettings(GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (result && result.star_message_id) {
				await api(this.client)
					.channels(channel)
					.messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}
}
