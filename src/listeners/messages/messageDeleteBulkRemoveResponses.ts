import { CommandMatcher, readSettings } from '#lib/database';
import { Events, type GuildMessage } from '#lib/types';
import { deleteMessage, getCommand } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { get } from '@sapphire/plugin-editable-commands';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import { Collection, type Message, type Snowflake } from 'discord.js';

type MessageCollection = Collection<Snowflake, Message<true>>;

@ApplyOptions<Listener.Options>({ event: Events.MessageDeleteBulk })
export class UserListener extends Listener<Events.MessageDeleteBulk> {
	public async run(messages: MessageCollection) {
		// If, for some reason, this was emitted with no messages, skip all:
		if (messages.size === 0) return;

		const first = messages.first()!;

		// If the auto-delete behavior cannot be customized, delete all:
		if (!this.canBeCustomized(first)) return this.deleteAll(messages);

		const settings = await readSettings(first.guild);

		// If auto-delete is disabled globally, skip all:
		if (settings.messagesAutoDeleteIgnoredAll) return;

		// If the channel is ignored, skip all:
		if (settings.messagesAutoDeleteIgnoredChannels.includes(first.channel.id)) return;

		// If the auto-delete behavior is not changed, delete all:
		const ignoredCommands = settings.messagesAutoDeleteIgnoredCommands;
		const ignoredRoles = settings.messagesAutoDeleteIgnoredRoles;
		if (ignoredCommands.length === 0 && ignoredRoles.length === 0) return this.deleteAll(messages);

		for (const message of messages.values()) {
			const response = get(message);
			if (response === null) continue;

			// If the message should be ignored, skip:
			if (this.shouldBeIgnored(message as GuildMessage, ignoredCommands, ignoredRoles)) continue;

			// Delete the response:
			await deleteMessage(response);
		}
	}

	private canBeCustomized(message: Message): message is GuildMessage {
		return message.guild !== null;
	}

	private shouldBeIgnored(message: GuildMessage, ignoredCommands: readonly string[], ignoredRoles: readonly string[]): boolean {
		// Check for ignored roles:
		if (hasAtLeastOneKeyInMap(message.member.roles.cache, ignoredRoles)) return true;

		// Check for ignored commands:
		const command = getCommand(message);
		if (command !== null && CommandMatcher.matchAny(ignoredCommands, command)) return true;

		return false;
	}

	private async deleteAll(messages: MessageCollection) {
		for (const message of messages.values()) {
			const response = get(message);
			if (response !== null) await deleteMessage(response);
		}
	}
}
