import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { canReadMessages, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v10';
import type { TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.MessageReactionRemove, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayMessageReactionRemoveDispatch['d']) {
		const channel = this.container.client.channels.cache.get(data.channel_id) as TextChannel;
		if (!channel || !isGuildBasedChannel(channel) || !canReadMessages(channel)) return;
		this.container.client.emit(Events.RawReactionRemove, channel, data);
	}
}
