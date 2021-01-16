import { Events } from '#lib/types/Enums';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { isTextBasedChannel, resolveEmoji } from '#utils/util';
import { GatewayDispatchEvents, GatewayMessageReactionAddDispatch } from 'discord-api-types/v6';
import type { TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: GatewayDispatchEvents.MessageReactionAdd, emitter: store.client.ws });
	}

	public run(raw: GatewayMessageReactionAddDispatch['d']) {
		const channel = this.client.channels.cache.get(raw.channel_id) as TextChannel | undefined;
		if (!channel || !isTextBasedChannel(channel) || !channel.readable) return;

		const data: LLRCData = {
			channel,
			emoji: {
				animated: raw.emoji.animated ?? false,
				id: raw.emoji.id,
				managed: raw.emoji.managed ?? null,
				name: raw.emoji.name,
				requireColons: raw.emoji.require_colons ?? null,
				roles: raw.emoji.roles || null,
				user: (raw.emoji.user && this.client.users.add(raw.emoji.user)) ?? { id: raw.user_id }
			},
			guild: channel.guild,
			messageID: raw.message_id,
			userID: raw.user_id
		};

		for (const llrc of this.client.llrCollectors) {
			llrc.send(data);
		}

		const emoji = resolveEmoji(data.emoji);
		if (emoji === null) return;

		this.client.emit(Events.RawReactionAdd, data, emoji);
	}
}
