import { CommandMatcher, GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { deleteMessage, getCommand } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import type { Collection, Message, Snowflake } from 'discord.js';

type MessageCollection = Collection<Snowflake, Message>;

@ApplyOptions<EventOptions>({ event: Events.MessageDeleteBulk })
export class UserEvent extends Event<Events.MessageDeleteBulk> {
	public async run(messages: MessageCollection) {
		// If, for some reason, this was emitted with no messages, skip all:
		if (messages.size === 0) return;

		const first = messages.first()!;

		// If the auto-delete behavior cannot be customized, delete all:
		if (!this.canBeCustomized(first)) return this.deleteAll(messages);

		const [ignoredAll, ignoredChannels, ignoredCommands, ignoredRoles] = await readSettings(first.guild, [
			GuildSettings.Messages.AutoDelete.IgnoredAll,
			GuildSettings.Messages.AutoDelete.IgnoredChannels,
			GuildSettings.Messages.AutoDelete.IgnoredCommands,
			GuildSettings.Messages.AutoDelete.IgnoredRoles
		]);

		// If auto-delete is disabled globally, skip all:
		if (ignoredAll) return;

		// If the channel is ignored, skip all:
		if (ignoredChannels.includes(first.channel.id)) return;

		// If the auto-delete behavior is not changed, delete all:
		if (ignoredCommands.length === 0 && ignoredRoles.length === 0) return this.deleteAll(messages);

		for (const message of messages.values()) {
			// If the message should be ignored, skip:
			if (this.shouldBeIgnored(message as GuildMessage, ignoredCommands, ignoredRoles)) continue;

			// Delete all responses:
			for (const response of message.responses) {
				await deleteMessage(response);
			}
		}
	}

	private canBeCustomized(message: Message): message is GuildMessage {
		return message.guild !== null;
	}

	private shouldBeIgnored(message: GuildMessage, ignoredCommands: string[], ignoredRoles: string[]): boolean {
		// Check for ignored roles:
		if (hasAtLeastOneKeyInMap(message.member.roles.cache, ignoredRoles)) return true;

		// Check for ignored commands:
		const command = getCommand(message);
		if (command !== null && CommandMatcher.matchAny(ignoredCommands, command)) return true;

		return false;
	}

	private async deleteAll(messages: MessageCollection) {
		for (const message of messages.values()) {
			for (const response of message.responses) {
				await deleteMessage(response);
			}
		}
	}
}
