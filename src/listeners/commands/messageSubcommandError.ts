import { Listener } from '@sapphire/framework';
import type { MessageSubcommandErrorPayload, SubcommandPluginEvents } from '@sapphire/plugin-subcommands';
import { handleCommandError } from './_shared.js';

export class UserListener extends Listener<typeof SubcommandPluginEvents.MessageSubcommandError> {
	public run(error: unknown, payload: MessageSubcommandErrorPayload) {
		return handleCommandError(error, payload);
	}
}
