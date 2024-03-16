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
import { PermissionLevels, type TypedT } from '#lib/types';
import { first } from '#utils/common';
import { Command, UserError, type Awaitable, type MessageCommand } from '@sapphire/framework';
import { ChatInputCommandInteraction, type Message, type Snowflake } from 'discord.js';

/**
 * The base class for all Skyra commands.
 * @seealso {@link SkyraSubcommand} for subcommand support.
 */
export abstract class SkyraCommand extends Command<SkyraCommand.Args, SkyraCommand.Options> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;
	public declare readonly detailedDescription: TypedT<LanguageHelpDisplayOptions>;
	public declare readonly description: TypedT<string>;

	public constructor(context: Command.LoaderContext, options: SkyraCommand.Options) {
		super(context, { ...SkyraCommandConstructorDefaults, ...options });
		this.guarded = options.guarded ?? SkyraCommandConstructorDefaults.guarded;
		this.hidden = options.hidden ?? SkyraCommandConstructorDefaults.hidden;
		this.permissionLevel = options.permissionLevel ?? SkyraCommandConstructorDefaults.permissionLevel;
	}

	public abstract override messageRun(message: Message, args: SkyraCommand.Args, context: MessageCommand.RunContext): Awaitable<unknown>;

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public override messagePreParse(message: Message, parameters: string, context: MessageCommand.RunContext): Promise<SkyraCommand.Args> {
		return implementSkyraCommandPreParse(this as MessageCommand, message, parameters, context);
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		implementSkyraCommandError(identifier, context);
	}

	protected override parseConstructorPreConditions(options: SkyraCommand.Options): void {
		super.parseConstructorPreConditions(options);
		implementSkyraCommandParseConstructorPreConditionsPermissionLevel(this, options.permissionLevel);
	}

	/**
	 * Retrieves the global command id from the application command registry.
	 *
	 * @remarks This method is used for slash commands, and will throw an error
	 * if the global command ids are empty.
	 */
	protected getGlobalCommandId(): Snowflake {
		const ids = this.applicationCommandRegistry.globalChatInputCommandIds;
		if (ids.size === 0) throw new Error('The global command ids are empty.');
		return first(ids.values())!;
	}

	public static readonly PaginatedOptions = implementSkyraCommandPaginatedOptions<SkyraCommand.Options>;
}

export namespace SkyraCommand {
	export type Options = ExtendOptions<Command.Options>;
	export type Args = SkyraArgs;
	export type LoaderContext = Command.LoaderContext;
	export type RunContext = MessageCommand.RunContext;

	export type Interaction = ChatInputCommandInteraction<'cached'>;
}
