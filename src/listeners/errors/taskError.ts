import type { TaskErrorPayload } from '#lib/types';
import type { Events } from '#lib/types/Enums';
import { Listener } from '@sapphire/framework';

export class UserListener extends Listener<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		this.container.logger.fatal(`[TASK] ${context.piece.name}\n${error.stack || error.message}`);
	}
}
