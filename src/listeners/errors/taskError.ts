import type { Events, TaskErrorPayload } from '#lib/types';
import { Listener } from '@sapphire/framework';

export class UserListener extends Listener<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		this.container.logger.fatal(`[TASK] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
