import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserEvent extends Event {
	public run(data: GatewayGuildCreateDispatch['d'], shardID: number) {
		this.context.client.guildMemberFetchQueue.add(shardID, data.id);
	}
}
