import { GuildSettings, readSettings } from '#lib/database';
import { Events } from '#lib/types';
import { getLogger, getModeration } from '#utils/functions';
import { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNumber } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberUpdate })
export class UserListener extends Listener {
	public async run(previous: GuildMember, next: GuildMember) {
		const prevTimeout = this.#getTimeout(previous);
		const nextTimeout = this.#getTimeout(next);
		if (prevTimeout === nextTimeout) return;

		const { user, guild } = next;
		const logger = getLogger(guild);
		const actionBySkyra = logger.timeout.isSet(next.id);
		const contextPromise = logger.timeout.wait(next.id);

		// If the action was done by Skyra, or external timeout is enabled, create a moderation action:
		if (!actionBySkyra && (await readSettings(next, GuildSettings.Events.Timeout))) {
			const context = await contextPromise;
			const moderation = getModeration(guild);
			await moderation.waitLock();

			if (moderation.checkSimilarEntryHasBeenCreated(TypeVariation.Timeout, user.id)) return;

			const duration = this.#getDuration(nextTimeout);
			const entry = moderation.create({
				user,
				moderator: context?.userId,
				type: TypeVariation.Timeout,
				metadata: duration ? TypeMetadata.Temporary : TypeMetadata.Undo,
				duration,
				reason: context?.reason
			});
			await moderation.insert(entry);
		}
	}

	#getTimeout(member: GuildMember) {
		const timeout = member.communicationDisabledUntilTimestamp;
		return isNumber(timeout) && timeout >= Date.now() ? timeout : null;
	}

	#getDuration(timeout: number | null) {
		if (timeout === null) return null;

		const now = Date.now();
		return timeout > now ? timeout - now : null;
	}
}
