import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.MessageDeleteBulk, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayMessageDeleteBulkDispatch['d']): void {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		this.container.client.emit(Events.RawMessageDeleteBulk, guild, data);
	}
}
