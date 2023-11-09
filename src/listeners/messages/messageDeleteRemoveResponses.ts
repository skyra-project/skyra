import { CommandMatcher, GuildSettings, readSettings } from '#lib/database';
import { Events, type GuildMessage } from '#lib/types';
import { deleteMessage, getCommand } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { get } from '@sapphire/plugin-editable-commands';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.MessageDelete })
export class UserListener extends Listener {
	public async run(message: Message) {
		const response = get(message);

		// If there are no responses, skip:
		if (response === null) return;

		// If the message should be ignored, skip:
		if (await this.shouldBeIgnored(message)) return;

		// Delete the response:
		await deleteMessage(response);
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
		const command = getCommand(message);
		if (command !== null && CommandMatcher.matchAny(ignoredCommands, command)) return true;

		return false;
	}
}
