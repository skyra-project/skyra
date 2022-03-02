import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import type { CustomGet } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { seconds } from '#utils/common';
import { CommandContext, PieceContext, PreconditionContainerArray, UserError } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';
import { SkyraArgs } from './parsers/SkyraArgs';

export abstract class SkyraCommand extends SubCommandPluginCommand<SkyraCommand.Args, SkyraCommand> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;
	public readonly description: CustomGet<string, string>;

	public constructor(context: PieceContext, options: SkyraCommand.Options) {
		super(context, { cooldownDelay: seconds(10), cooldownLimit: 2, cooldownFilteredUsers: OWNERS, generateDashLessAliases: true, ...options });

		this.guarded = options.guarded ?? false;
		this.hidden = options.hidden ?? false;
		this.permissionLevel = options.permissionLevel ?? PermissionLevels.Everyone;
		this.description = options.description;
	}

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public async preParse(message: Message, parameters: string, context: CommandContext): Promise<SkyraCommand.Args> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new SkyraArgs(message, this, args, context, await fetchT(message));
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
	}

	protected parseConstructorPreConditions(options: SkyraCommand.Options): void {
		super.parseConstructorPreConditions(options);
		this.parseConstructorPreConditionsPermissionLevel(options);
	}

	protected parseConstructorPreConditionsPermissionLevel(options: SkyraCommand.Options): void {
		if (options.permissionLevel === PermissionLevels.BotOwner) {
			this.preconditions.append('BotOwner');
			return;
		}

		const container = new PreconditionContainerArray(['BotOwner'], this.preconditions);
		switch (options.permissionLevel ?? PermissionLevels.Everyone) {
			case PermissionLevels.Everyone:
				container.append('Everyone');
				break;
			case PermissionLevels.Moderator:
				container.append('Moderator');
				break;
			case PermissionLevels.Administrator:
				container.append('Administrator');
				break;
			case PermissionLevels.ServerOwner:
				container.append('ServerOwner');
				break;
			default:
				throw new Error(
					`SkyraCommand[${this.name}]: "permissionLevel" was specified as an invalid permission level (${options.permissionLevel}).`
				);
		}

		this.preconditions.append(container);
	}
}

export interface SkyraCommand {
	detailedDescription: CustomGet<string, LanguageHelpDisplayOptions>;
}

export namespace SkyraCommand {
	/**
	 * The SkyraCommand Options
	 */
	export type Options = SubCommandPluginCommand.Options & {
		description: CustomGet<string, string>;
		detailedDescription: CustomGet<string, LanguageHelpDisplayOptions>;
		guarded?: boolean;
		hidden?: boolean;
		permissionLevel?: number;
	};

	export type Args = SkyraArgs;
	export type Context = CommandContext;
}
