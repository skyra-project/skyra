import type { ScheduleEntry, Task } from '#lib/schedule';
import type { IPieceError } from '@sapphire/framework';

export interface TaskErrorPayload extends IPieceError {
	piece: Task;
	entry: ScheduleEntry;
}
