import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { SkyraArgs } from '#lib/structures/commands/SkyraArgs';
import {
	SkyraCommandConstructorDefaults,
	implementSkyraCommandError,
	implementSkyraCommandPaginatedOptions,
	implementSkyraCommandParseConstructorPreConditionsPermissionLevel,
	implementSkyraCommandPreParse,
	type ExtendOptions
} from '#lib/structures/commands/base/BaseSkyraCommandUtilities';
import { PermissionLevels, type CustomGet } from '#lib/types';
import { Command, UserError, type MessageCommand } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

/**
 * The base class for all Skyra commands with subcommands.
 * @seealso {@link SkyraCommand}.
 */
export class SkyraSubcommand extends Subcommand<SkyraSubcommand.Args, SkyraSubcommand.Options> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;
	public declare readonly detailedDescription: CustomGet<string, LanguageHelpDisplayOptions>;
	public override readonly description: CustomGet<string, string>;

	public constructor(context: SkyraSubcommand.LoaderContext, options: SkyraSubcommand.Options) {
		super(context, { ...SkyraCommandConstructorDefaults, ...options });
		this.guarded = options.guarded ?? SkyraCommandConstructorDefaults.guarded;
		this.hidden = options.hidden ?? SkyraCommandConstructorDefaults.hidden;
		this.permissionLevel = options.permissionLevel ?? SkyraCommandConstructorDefaults.permissionLevel;
		this.description = options.description;
	}

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public override messagePreParse(message: Message, parameters: string, context: MessageCommand.RunContext): Promise<SkyraSubcommand.Args> {
		return implementSkyraCommandPreParse(this as MessageCommand, message, parameters, context);
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		implementSkyraCommandError(identifier, context);
	}

	protected override parseConstructorPreConditions(options: SkyraSubcommand.Options): void {
		super.parseConstructorPreConditions(options);
		implementSkyraCommandParseConstructorPreConditionsPermissionLevel(this, options.permissionLevel);
	}

	public static readonly PaginatedOptions = implementSkyraCommandPaginatedOptions<SkyraSubcommand.Options>;
}

export namespace SkyraSubcommand {
	export type Options = ExtendOptions<Subcommand.Options>;
	export type Args = SkyraArgs;
	export type LoaderContext = Command.LoaderContext;
	export type RunContext = MessageCommand.RunContext;
}
