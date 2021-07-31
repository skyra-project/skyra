import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageDeleteDispatch } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.MessageDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayMessageDeleteDispatch['d']): void {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		this.container.client.emit(Events.RawMessageDelete, guild, data);
	}
}
