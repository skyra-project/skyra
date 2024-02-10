import { getLogger } from '#utils/functions/guild';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AuditLogEvent, GatewayDispatchEvents, type GatewayGuildAuditLogEntryCreateDispatchData } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildAuditLogEntryCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public override run(data: GatewayGuildAuditLogEntryCreateDispatchData) {
		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild) return;

		switch (data.action_type) {
			case AuditLogEvent.MessageBulkDelete:
				getLogger(guild).prune.setFromAuditLogs(data.target_id!, { userId: data.user_id! });
				break;
			default:
				break;
		}
	}
}
