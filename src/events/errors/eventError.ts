import { Event, EventErrorPayload, Events } from '@sapphire/framework';

export class UserEvent extends Event<Events.EventError> {
	public run(error: Error, context: EventErrorPayload) {
		this.context.client.logger.fatal(`[EVENT] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
