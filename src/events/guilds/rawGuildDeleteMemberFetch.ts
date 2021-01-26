import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayGuildDeleteDispatch['d'], shardID: number) {
		this.context.client.guildMemberFetchQueue.remove(shardID, data.id);
	}
}
