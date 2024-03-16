import { Listener } from '@sapphire/framework';
import type { ChatInputSubcommandErrorPayload, SubcommandPluginEvents } from '@sapphire/plugin-subcommands';
import { handleCommandError } from './_chat-input-shared.js';

export class UserListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
	public run(error: Error, payload: ChatInputSubcommandErrorPayload) {
		return handleCommandError(error, payload);
	}
}
