import { Events } from '#lib/types/Enums';
import { canReadMessages, isGuildBasedChannel } from '#utils/functions';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { resolveEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionAddDispatch } from 'discord-api-types/v6';
import type { TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionAdd, emitter: 'ws' })
export class UserEvent extends Event {
	public run(raw: GatewayMessageReactionAddDispatch['d']) {
		const channel = this.context.client.channels.cache.get(raw.channel_id) as TextChannel | undefined;
		if (!channel || !isGuildBasedChannel(channel) || !canReadMessages(channel)) return;

		const data: LLRCData = {
			channel,
			emoji: {
				animated: raw.emoji.animated ?? false,
				id: raw.emoji.id,
				managed: raw.emoji.managed ?? null,
				name: raw.emoji.name,
				requireColons: raw.emoji.require_colons ?? null,
				roles: raw.emoji.roles || null,
				user: (raw.emoji.user && this.context.client.users.add(raw.emoji.user)) ?? { id: raw.user_id }
			},
			guild: channel.guild,
			messageID: raw.message_id,
			userID: raw.user_id
		};

		for (const llrc of this.context.client.llrCollectors) {
			llrc.send(data);
		}

		const emoji = resolveEmoji(data.emoji);
		if (emoji === null) return;

		this.context.client.emit(Events.RawReactionAdd, data, emoji);
	}
}
