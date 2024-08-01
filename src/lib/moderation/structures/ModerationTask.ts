import { readSettings } from '#lib/database';
import type { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { ResponseType, Task, type PartialResponseValue } from '#lib/schedule';
import { getModeration } from '#utils/functions';
import type { SchemaKeys } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import type { Guild, Snowflake } from 'discord.js';

export abstract class ModerationTask<T = unknown> extends Task {
	public async run(data: ModerationData<T>): Promise<PartialResponseValue> {
		const guild = this.container.client.guilds.cache.get(data.guildID);
		// If the guild is not available, cancel the task.
		if (isNullish(guild)) return { type: ResponseType.Ignore };

		// If the guild is not available, re-schedule the task by creating
		// another with the same data but happening 20 seconds later.
		if (!guild.available) return { type: ResponseType.Delay, value: 20000 };

		// Run the abstract handle function.
		try {
			await this.handle(guild, data);
		} catch {
			/* noop */
		}

		// Mark the moderation entry as complete.
		await getModeration(guild).complete(data.caseID);

		return { type: ResponseType.Finished };
	}

	protected async getActionData<ContextType = never>(
		guild: Guild,
		targetId: Snowflake,
		context?: ContextType
	): Promise<ModerationAction.Data<ContextType>> {
		const settings = await readSettings(guild);
		return {
			moderator: null,
			sendDirectMessage: settings.messagesModerationDm && (await this.container.prisma.user.fetchModerationDirectMessageEnabled(targetId)),
			context
		};
	}

	protected abstract handle(guild: Guild, data: ModerationData<T>): unknown;
}

export interface ModerationData<T = unknown> {
	[SchemaKeys.Case]: number;
	[SchemaKeys.Guild]: string;
	[SchemaKeys.User]: string;
	[SchemaKeys.Duration]: number;
	[SchemaKeys.ExtraData]: T;
	scheduleRetryCount?: number;
}
