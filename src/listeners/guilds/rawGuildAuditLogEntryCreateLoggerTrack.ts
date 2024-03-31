import { getLogger } from '#utils/functions/guild';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { AuditLogEvent, GatewayDispatchEvents, Guild, type GatewayGuildAuditLogEntryCreateDispatchData } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildAuditLogEntryCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public override run(data: GatewayGuildAuditLogEntryCreateDispatchData) {
		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild) return;

		switch (data.action_type) {
			case AuditLogEvent.MemberUpdate:
				return this.#handleMemberUpdateTimeout(guild, data);
			case AuditLogEvent.MessageBulkDelete:
				getLogger(guild).prune.setFromAuditLogs(data.target_id!, { userId: data.user_id! });
				break;
			default:
				break;
		}
	}

	#handleMemberUpdateTimeout(guild: Guild, data: GatewayGuildAuditLogEntryCreateDispatchData) {
		if (isNullishOrEmpty(data.changes)) return;

		const change = data.changes.find((change) => change.key === 'communication_disabled_until');
		if (isNullish(change)) return;

		getLogger(guild).timeout.setFromAuditLogs(data.target_id!, {
			userId: data.user_id!,
			reason: data.reason
		});
	}
}
