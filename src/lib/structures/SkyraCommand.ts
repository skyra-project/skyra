import { CustomGet } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';
import { PermissionResolvable, Permissions } from 'discord.js';
import { Command, CommandOptions, CommandStore, KlasaMessage } from 'klasa';

export abstract class SkyraCommand extends Command {
	public description: CustomGet<string, string>;
	public extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;

	public spam: boolean;
	public requiredGuildPermissions: Permissions;

	public constructor(store: CommandStore, file: string[], directory: string, options: SkyraCommandOptions) {
		super(store, file, directory, {
			spam: false,
			requiredGuildPermissions: 0,
			...options
		});

		this.description = options.description;
		this.extendedHelp = options.extendedHelp;

		this.spam = options.spam!;
		this.requiredGuildPermissions = new Permissions(options.requiredGuildPermissions);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: KlasaMessage, _params: any[]): any {
		return message;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}
}

export interface SkyraCommandOptions extends CommandOptions {
	description: CustomGet<string, string>;
	extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
	spam?: boolean;
	requiredGuildPermissions?: PermissionResolvable;
}
