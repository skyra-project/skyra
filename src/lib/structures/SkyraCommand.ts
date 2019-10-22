import { Command, CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';
import { Permissions, PermissionResolvable } from 'discord.js';

export abstract class SkyraCommand extends Command {

	public spam: boolean;
	public requiredGuildPermissions: Permissions;

	public constructor(store: CommandStore, file: string[], directory: string, options: SkyraCommandOptions = {}) {
		super(store, file, directory, util.mergeDefault({ spam: false, requiredGuildPermissions: 0 }, options));
		this.spam = options.spam!;
		this.requiredGuildPermissions = new Permissions(options.requiredGuildPermissions!);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: KlasaMessage, _params: any[]): any { return message; }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}

export interface SkyraCommandOptions extends CommandOptions {
	spam?: boolean;
	requiredGuildPermissions?: PermissionResolvable;
}
