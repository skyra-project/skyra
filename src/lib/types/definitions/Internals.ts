import type { ScheduleEntity, Task } from '#lib/database';
import type { Event, IPieceError } from '@sapphire/framework';
import type { Message } from 'discord.js';

export interface CommandHandler extends Event {
	run(message: Message): Promise<void>;
	runCommand(message: Message): Promise<void>;
}

export interface TaskErrorPayload extends IPieceError {
	piece: Task;
	entity: ScheduleEntity;
}
