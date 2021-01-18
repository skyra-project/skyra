import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayGuildCreateDispatch['d']) {
		return Promise.all(data.voice_states!.map((state) => this.context.client.audio.voiceStateUpdate({ ...state, guild_id: data.id })));
	}
}
