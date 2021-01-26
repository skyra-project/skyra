import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export interface CommandHandler extends Event {
	run(message: Message): Promise<void>;
	runCommand(message: Message): Promise<void>;
}
