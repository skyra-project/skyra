import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayGuildDeleteDispatch['d']) {
		if (data.unavailable) return;

		this.context.client.settings.guilds.delete(data.id);
		this.context.client.audio.queues?.delete(data.id);
	}
}
