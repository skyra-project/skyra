import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayGuildCreateDispatch['d'], shardID: number) {
		this.context.client.guildMemberFetchQueue.add(shardID, data.id);
	}
}
