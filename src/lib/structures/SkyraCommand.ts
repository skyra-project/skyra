import { Command, CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';
import { SkyraClient } from '../SkyraClient';

export abstract class SkyraCommand extends Command {

	public client: SkyraClient;
	public spam: boolean;

	public constructor(store: CommandStore, file: string[], directory: string, options: SkyraCommandOptions = {}) {
		super(store, file, directory, util.mergeDefault({ spam: false }, options));
		this.spam = options.spam;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: KlasaMessage, params: any[]): any { return message; }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}

interface SkyraCommandOptions extends CommandOptions {
	spam?: boolean;
}
