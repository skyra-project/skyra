import { LoggerTypeManager } from '#lib/moderation/managers/loggers/base/LoggerTypeManager';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { AuditLogEvent } from 'discord.js';

export class TimeoutLoggerTypeManager extends LoggerTypeManager {
	public constructor(manager: LoggerTypeManager.Manager) {
		super(manager, AuditLogEvent.MemberUpdate);
	}

	protected override filterAuditLogEntry(entry: LoggerTypeManager.AuditLogEntry) {
		return !isNullishOrEmpty(entry.changes) && entry.changes.some((change) => change.key === 'communication_disabled_until');
	}
}
