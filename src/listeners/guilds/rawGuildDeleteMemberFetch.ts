import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildDeleteDispatchData } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildDeleteDispatchData, shardId: number) {
		this.container.client.guildMemberFetchQueue.remove(shardId, data.id);
	}
}
