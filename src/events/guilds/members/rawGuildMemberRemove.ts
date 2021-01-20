import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { GatewayDispatchEvents, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.GuildMemberRemove, emitter: 'ws' })
export default class extends Event {
	public run(data: GatewayGuildMemberRemoveDispatch['d']) {
		const guild = this.context.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.available) return;

		const member = guild.members.cache.get(data.user.id) ?? null;
		this.context.client.emit(Events.RawMemberRemove, guild, member, data);
	}
}
