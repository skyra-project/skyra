import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { isTextBasedChannel, resolveEmoji } from '@utils/util';
import { GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v6';
import { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ name: Events.RawReactionRemove })
export default class extends Event {
	public async run(channel: TextChannel, data: GatewayMessageReactionRemoveDispatch['d']) {
		// If the channel is not a text channel then stop processing
		if (!isTextBasedChannel(channel)) return;

		const parsed = resolveEmoji(data.emoji);
		if (!parsed) return;

		const roleEntry = await channel.guild.readSettings((settings) =>
			settings.reactionRoles.find(
				(entry) => entry.emoji === parsed && entry.channel === data.channel_id && (entry.message ? entry.message === data.message_id : true)
			)
		);
		if (!roleEntry) return;

		try {
			const member = await channel.guild.members.fetch(data.user_id);
			if (member.roles.cache.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}
}
