import { Command, CommandOptions, CommandStore, KlasaClient, KlasaMessage, util } from 'klasa';
import { SkyraClient } from '../SkyraClient';

export abstract class SkyraCommand extends Command {

	public client: SkyraClient;
	public spam: boolean;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string, options: SkyraCommandOptions = {}) {
		super(client, store, file, directory, util.mergeDefault({ spam: false }, options));
		this.spam = options.spam;
	}

	// @ts-ignore
	public run(message: KlasaMessage, params: any[]): any { return message; }

	// @ts-ignore
	public inhibit(message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}

interface SkyraCommandOptions extends CommandOptions {
	spam?: boolean;
}
