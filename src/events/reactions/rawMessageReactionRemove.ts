import { Events } from '#lib/types/Enums';
import { canReadMessages, isGuildBasedChannel } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v6';
import type { TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionRemove, emitter: 'ws' })
export class UserEvent extends Event {
	public run(data: GatewayMessageReactionRemoveDispatch['d']) {
		const channel = this.context.client.channels.cache.get(data.channel_id) as TextChannel;
		if (!channel || !isGuildBasedChannel(channel) || !canReadMessages(channel)) return;
		this.context.client.emit(Events.RawReactionRemove, channel, data);
	}
}
