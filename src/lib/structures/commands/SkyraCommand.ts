import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import type { CustomGet } from '#lib/types';
import { Message, PermissionResolvable, Permissions } from 'discord.js';
import { Command, CommandOptions, PieceContext } from 'klasa';

export namespace SkyraCommand {
	/**
	 * The SkyraCommand Options
	 */
	export type Options = CommandOptions & {
		description: CustomGet<string, string>;
		extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
		spam?: boolean;
		requiredGuildPermissions?: PermissionResolvable;
	};
}

export abstract class SkyraCommand extends Command {
	public description: CustomGet<string, string>;
	public extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;

	public spam: boolean;
	public requiredGuildPermissions: Permissions;

	public constructor(context: PieceContext, options: SkyraCommand.Options) {
		super(context, {
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
	public run(message: Message, _params: any[]): any {
		return message;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: Message): Promise<boolean> | boolean {
		return false;
	}
}
