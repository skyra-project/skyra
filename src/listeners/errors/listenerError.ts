import { Events, Listener, ListenerErrorPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, context: ListenerErrorPayload) {
		this.container.logger.fatal(`[EVENT] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
