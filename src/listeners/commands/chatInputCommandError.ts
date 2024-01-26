import { Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, payload: ChatInputCommandErrorPayload) {
		this.container.logger.fatal(`[COMMAND] ${payload.command.location.full}\n${error.stack || error.message}`);
	}
}
