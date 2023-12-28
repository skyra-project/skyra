import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildDeleteDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildDeleteDispatch['d'], shardId: number) {
		this.container.client.guildMemberFetchQueue.remove(shardId, data.id);
	}
}
