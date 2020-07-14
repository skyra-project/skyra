import { KlasaMessage, Monitor } from 'klasa';

export interface CommandHandler extends Monitor {
	run(message: KlasaMessage): Promise<void>;
	runCommand(message: KlasaMessage): Promise<void>;
}
