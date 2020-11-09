import { Events } from '@lib/types/Enums';
import { isTextBasedChannel } from '@utils/util';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v6';
import { TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: GatewayDispatchEvents.MessageReactionRemove, emitter: store.client.ws });
	}

	public run(data: GatewayMessageReactionRemoveDispatch['d']) {
		const channel = this.client.channels.cache.get(data.channel_id) as TextChannel;
		if (!channel || !channel.readable || !isTextBasedChannel(channel)) return;
		this.client.emit(Events.RawReactionRemove, channel, data);
	}
}
