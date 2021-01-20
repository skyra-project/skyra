import { Events } from '#lib/types/Enums';
import { isTextBasedChannel } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v6';
import type { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionRemove, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayMessageReactionRemoveDispatch['d']) {
		const channel = this.context.client.channels.cache.get(data.channel_id) as TextChannel;
		if (!channel || !channel.readable || !isTextBasedChannel(channel)) return;
		this.context.client.emit(Events.RawReactionRemove, channel, data);
	}
}
