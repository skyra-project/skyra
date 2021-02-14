import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import type { CustomGet } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Awaited, CommandContext, PermissionsPrecondition, PieceContext, PreconditionEntryResolvable, UserError } from '@sapphire/framework';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import { Message, PermissionResolvable } from 'discord.js';
import * as Lexure from 'lexure';
import { sep } from 'path';
import { SkyraArgs } from './parsers/SkyraArgs';

export abstract class SkyraCommand extends SubCommandPluginCommand<SkyraCommand.Args, SkyraCommand> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;
	public readonly description: CustomGet<string, string>;
	public readonly extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;

	/**
	 * The full category for the command
	 * @since 0.0.1
	 * @type {string[]}
	 */
	public readonly fullCategory: readonly string[];

	public constructor(context: PieceContext, options: SkyraCommand.Options) {
		super(context, SkyraCommand.resolvePreConditions(context, options));

		this.guarded = options.guarded ?? false;
		this.hidden = options.hidden ?? false;
		this.permissionLevel = options.permissionLevel ?? PermissionLevels.Everyone;
		this.description = options.description;
		this.extendedHelp = options.extendedHelp;

		// Hack that works for Skyra as the commands are always in **/commands/**/*
		const paths = context.path.split(sep);
		this.fullCategory = paths.slice(paths.indexOf('commands') + 1, -1);
	}

	/**
	 * The main category for the command
	 */
	public get category(): string {
		return this.fullCategory.length > 0 ? this.fullCategory[0] : 'General';
	}

	/**
	 * The sub category for the command
	 */
	public get subCategory(): string {
		return this.fullCategory.length > 1 ? this.fullCategory[1] : 'General';
	}

	/**
	 * The pre-parse method. This method can be overriden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public async preParse(message: Message, parameters: string, context: CommandContext): Promise<SkyraCommand.Args> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new SkyraArgs(message, this, args, context, await message.fetchT());
	}

	public run(message: Message, args: SkyraCommand.Args, context: SkyraCommand.Context): Awaited<unknown> {
		if (!this.subCommands) throw new Error(`The command ${this.name} does not have a 'run' method and does not support sub-commands.`);
		return this.subCommands.run({ message, args, context, command: this });
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
	}

	protected static resolvePreConditions(context: PieceContext, options: SkyraCommand.Options): SkyraCommand.Options {
		options.generateDashLessAliases ??= true;

		const preconditions = (options.preconditions ??= []) as PreconditionEntryResolvable[];

		if (options.nsfw) preconditions.push('NSFW');
		if (options.spam) preconditions.push('Spam');
		if (options.permissions) preconditions.push(new PermissionsPrecondition(options.permissions));

		const runInPreCondition = this.resolveRunInPreCondition(context, options.runIn);
		if (runInPreCondition !== null) preconditions.push(runInPreCondition);

		const permissionLevelPreCondition = this.resolvePermissionLevelPreCondition(options.permissionLevel);
		if (permissionLevelPreCondition !== null) preconditions.push(permissionLevelPreCondition);

		if (options.bucket && options.cooldown) {
			preconditions.push({ name: 'Cooldown', context: { bucket: options.bucket, cooldown: options.cooldown } });
		}

		return options;
	}

	protected static resolvePermissionLevelPreCondition(permissionLevel = 0): PreconditionEntryResolvable | null {
		if (permissionLevel === 0) return null;
		if (permissionLevel <= PermissionLevels.Moderator) return ['BotOwner', 'Moderator'];
		if (permissionLevel <= PermissionLevels.Administrator) return ['BotOwner', 'Administrator'];
		if (permissionLevel <= PermissionLevels.BotOwner) return 'BotOwner';
		return null;
	}

	protected static resolveRunInPreCondition(context: PieceContext, runIn?: SkyraCommand.RunInOption[]): PreconditionEntryResolvable | null {
		runIn = [...new Set(runIn ?? (['text', 'news', 'dm'] as const))];

		// If all channels are allowed, do not add a precondition:
		if (runIn.length === 3) return null;
		if (runIn.length === 0) throw new Error(`SkyraCommand[${context.name}]: "runIn" was specified as an empty array.`);

		const array: string[] = [];
		if (runIn.includes('dm')) array.push('DMOnly');

		const hasText = runIn.includes('text');
		const hasNews = runIn.includes('news');
		if (hasText && hasNews) array.push('GuildOnly');
		else if (hasText) array.push('TextOnly');
		else if (hasNews) array.push('NewsOnly');

		return array;
	}
}

export namespace SkyraCommand {
	export type RunInOption = 'text' | 'news' | 'dm';

	/**
	 * The SkyraCommand Options
	 */
	export type Options = SubCommandPluginCommand.Options & {
		bucket?: number;
		cooldown?: number;
		description: CustomGet<string, string>;
		extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
		guarded?: boolean;
		hidden?: boolean;
		nsfw?: boolean;
		permissionLevel?: number;
		permissions?: PermissionResolvable;
		runIn?: RunInOption[];
		spam?: boolean;
	};

	export type Args = SkyraArgs;
	export type Context = CommandContext;
}
