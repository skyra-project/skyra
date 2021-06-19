import type { TaskErrorPayload } from '#lib/types';
import type { Events } from '#lib/types/Enums';
import { Event } from '@sapphire/framework';

export class UserEvent extends Event<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		this.context.client.logger.fatal(`[TASK] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
