import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildDeleteDispatch } from 'discord-api-types/v10';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildDeleteDispatch['d']) {
		if (data.unavailable) return;

		this.container.settings.guilds.delete(data.id);
	}
}
