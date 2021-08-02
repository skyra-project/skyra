import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildCreateDispatch['d']) {
		return Promise.all(data.voice_states!.map((state) => this.container.client.audio?.voiceStateUpdate({ ...state, guild_id: data.id })));
	}
}
