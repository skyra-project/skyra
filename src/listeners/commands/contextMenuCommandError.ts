import { Events, Listener, type ContextMenuCommandErrorPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.ContextMenuCommandError> {
	public run(error: Error, payload: ContextMenuCommandErrorPayload) {
		this.container.logger.fatal(`[COMMAND] ${payload.command.location.full}\n${error.stack || error.message}`);
	}
}
