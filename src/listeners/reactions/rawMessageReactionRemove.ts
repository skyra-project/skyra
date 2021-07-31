import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { canReadMessages, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v9';
import type { TextChannel } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.MessageReactionRemove, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayMessageReactionRemoveDispatch['d']) {
		const channel = this.container.client.channels.cache.get(data.channel_id) as TextChannel;
		if (!channel || !isGuildBasedChannel(channel) || !canReadMessages(channel)) return;
		this.container.client.emit(Events.RawReactionRemove, channel, data);
	}
}
