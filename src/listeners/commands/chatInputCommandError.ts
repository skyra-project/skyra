import { Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { handleCommandError } from './_chat-input-shared.js';

export class UserListener extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: unknown, payload: ChatInputCommandErrorPayload) {
		return handleCommandError(error, payload);
	}
}
