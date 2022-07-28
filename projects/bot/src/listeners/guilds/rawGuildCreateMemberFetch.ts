import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildCreateDispatch['d'], shardId: number) {
		this.container.client.guildMemberFetchQueue.add(shardId, data.id);
	}
}
