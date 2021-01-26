import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserEvent extends Event {
	public run(data: GatewayGuildCreateDispatch['d']) {
		return Promise.all(data.voice_states!.map((state) => this.context.client.audio.voiceStateUpdate({ ...state, guild_id: data.id })));
	}
}
