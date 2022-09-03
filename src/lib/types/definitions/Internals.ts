import type { ScheduleEntity, Task } from '#lib/database';
import type { IPieceError } from '@sapphire/framework';

export interface TaskErrorPayload extends IPieceError {
	piece: Task;
	entity: ScheduleEntity;
}
