import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord-api-types/v10';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildCreateDispatch['d'], shardId: number) {
		this.container.client.guildMemberFetchQueue.add(shardId, data.id);
	}
}
