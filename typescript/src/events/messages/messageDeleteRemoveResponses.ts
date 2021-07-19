import { CommandMatcher, GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import type { Message } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.MessageDelete })
export class UserEvent extends Event {
	public async run(message: Message) {
		const { responses } = message;

		// If there are no responses, skip:
		if (responses.length === 0) return;

		// If the message should be ignored, skip:
		if (await this.shouldBeIgnored(message)) return;

		// Delete all responses:
		for (const response of responses) {
			await response.nuke();
		}
	}

	private canBeCustomized(message: Message): message is GuildMessage {
		return message.guild !== null;
	}

	private async shouldBeIgnored(message: Message): Promise<boolean> {
		if (!this.canBeCustomized(message)) return false;

		const [ignoredAll, ignoredChannels, ignoredCommands, ignoredRoles] = await readSettings(message.guild, [
			GuildSettings.Messages.AutoDelete.IgnoredAll,
			GuildSettings.Messages.AutoDelete.IgnoredChannels,
			GuildSettings.Messages.AutoDelete.IgnoredCommands,
			GuildSettings.Messages.AutoDelete.IgnoredRoles
		]);

		// Check for ignored all:
		if (ignoredAll) return true;

		// Check for ignored channels:
		if (ignoredChannels.includes(message.channel.id)) return true;

		// Check for ignored roles:
		if (hasAtLeastOneKeyInMap(message.member.roles.cache, ignoredRoles)) return true;

		// Check for ignored commands:
		const { command } = message;
		if (command !== null && CommandMatcher.matchAny(ignoredCommands, command)) return true;

		return false;
	}
}
