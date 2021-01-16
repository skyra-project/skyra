import type { Message } from 'discord.js';
import { Event } from 'klasa';

export interface CommandHandler extends Event {
	run(message: Message): Promise<void>;
	runCommand(message: Message): Promise<void>;
}
