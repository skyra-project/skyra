import { Events, Listener, UserError, type ListenerErrorPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, context: ListenerErrorPayload) {
		// We generally do not care about `UserError`s in listeners since they're not bugs.
		if (error instanceof UserError) return;

		this.container.logger.fatal(`[EVENT] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
