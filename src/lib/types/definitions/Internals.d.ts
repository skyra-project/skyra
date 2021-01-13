import { Message } from 'discord.js';
import { Monitor } from 'klasa';

export interface CommandHandler extends Monitor {
	run(message: Message): Promise<void>;
	runCommand(message: Message): Promise<void>;
}
