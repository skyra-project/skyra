import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildDeleteDispatch['d'], shardId: number) {
		this.container.client.guildMemberFetchQueue.remove(shardId, data.id);
	}
}
