import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatchData } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildCreateDispatchData, shardId: number) {
		this.container.client.guildMemberFetchQueue.add(shardId, data.id);
	}
}
