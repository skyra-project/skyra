import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import type { CustomGet } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import {
	Awaited,
	Command,
	CommandContext,
	CommandOptions,
	err,
	Err,
	ok,
	Ok,
	PermissionsPrecondition,
	PieceContext,
	PreconditionEntryResolvable,
	UserError
} from '@sapphire/framework';
import { Message, PermissionResolvable } from 'discord.js';
import { sep } from 'path';
import { SkyraArgs } from './parsers/SkyraArgs';
import { SubCommandManager } from './sub-commands/SubCommandManager';

export abstract class SkyraCommand extends Command<SkyraCommand.Args> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;
	public readonly description: CustomGet<string, string>;
	public readonly extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
	public readonly subCommands: SubCommandManager | null;

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
		this.subCommands = options.subCommands ? new SubCommandManager(options.subCommands) : null;

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

	public run(message: Message, args: SkyraCommand.Args, context: CommandContext): Awaited<unknown> {
		if (!this.subCommands) throw new Error(`The command ${this.name} does not have a 'run' method and does not support sub-commands.`);
		return this.subCommands.run({ message, args, context, command: this });
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: Message): Promise<boolean> | boolean {
		return false;
	}

	protected ok<T>(value: T): Ok<T> {
		return ok(value);
	}

	protected error(value: null): Err<null>;
	protected error(value: string | UserError): Err<UserError>;
	protected error(value: null | string | UserError): Err<UserError | null>;
	protected error(value: null | string | UserError): Err<UserError | null> {
		return err(typeof value === 'string' ? new UserError({ identifier: 'CommandError', message: value }) : value);
	}

	protected static resolvePreConditions(context: PieceContext, options: SkyraCommand.Options): SkyraCommand.Options {
		const preconditions = (options.preconditions ??= []) as PreconditionEntryResolvable[];

		if (options.nsfw) preconditions.push('NSFW');
		if (options.spam) preconditions.push('Spam');
		if (options.permissions) preconditions.push(new PermissionsPrecondition(options.permissions));

		const permissionLevelPreCondition = this.resolvePermissionLevelPreCondition(options.permissionLevel);
		if (permissionLevelPreCondition !== null) preconditions.push(permissionLevelPreCondition);

		const runInPreCondition = this.resolveRunInPreCondition(context, options.runIn);
		if (runInPreCondition !== null) preconditions.push(runInPreCondition);

		if (options.bucket && options.cooldown) {
			preconditions.push({ name: 'Cooldown', context: { bucket: options.bucket, cooldown: options.cooldown } });
		}

		return options;
	}

	protected static resolvePermissionLevelPreCondition(permissionLevel = 0): PreconditionEntryResolvable | null {
		if (permissionLevel === 0) return null;
		if (permissionLevel <= PermissionLevels.Moderator) return ['Moderator', 'BotOwner'];
		if (permissionLevel <= PermissionLevels.Administrator) return ['Administrator', 'BotOwner'];
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
	export type Options = CommandOptions & {
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
		subCommands?: SubCommandManager.RawEntries;
	};

	export type Args = SkyraArgs;
	export type Context = CommandContext;
}
