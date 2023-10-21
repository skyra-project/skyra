import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v10';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.MessageDeleteBulk, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayMessageDeleteBulkDispatch['d']): void {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		this.container.client.emit(Events.RawMessageDeleteBulk, guild, data);
	}
}
