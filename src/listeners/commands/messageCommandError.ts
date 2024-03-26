import { Events, Listener, type MessageCommandErrorPayload } from '@sapphire/framework';
import { handleCommandError } from './_message-shared.js';

export class UserListener extends Listener<typeof Events.MessageCommandError> {
	public run(error: Error, payload: MessageCommandErrorPayload) {
		return handleCommandError(error, payload);
	}
}
