import { readSettings } from '#lib/database/settings';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { isAdmin, isGuildOwner } from '#utils/functions';
import { AllFlowsPrecondition, Identifiers, Precondition, type PreconditionOptions } from '@sapphire/framework';

export abstract class PermissionsPrecondition extends AllFlowsPrecondition {
	private readonly guildOnly: boolean;

	public constructor(context: Precondition.LoaderContext, options: PermissionsPrecondition.Options = {}) {
		super(context, options);
		this.guildOnly = options.guildOnly ?? true;
	}

	public override async messageRun(message: GuildMessage, command: SkyraCommand, context: Precondition.Context): Precondition.AsyncResult {
		// If not in a guild, resolve on an error:
		if (message.guild === null || message.member === null) {
			return this.guildOnly ? this.error({ identifier: Identifiers.PreconditionGuildOnly }) : this.ok();
		}

		// If it should skip, go directly to handle:
		if (await this.shouldRun(message, command)) {
			const settings = await readSettings(message.guild);
			const nodes = settings.permissionNodes;
			const result = nodes.run(message.member, command);
			if (result) return this.ok();
			if (result === false) return this.error({ identifier: LanguageKeys.Preconditions.PermissionNodes });
		}

		// Run the specific precondition's logic:
		return this.handle(message, command, context);
	}

	// Handled by Discord's permissions system:
	public override chatInputRun() {
		return this.ok();
	}

	// Handled by Discord's permissions system:
	public override contextMenuRun() {
		return this.ok();
	}

	public abstract handle(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.Result;

	private async shouldRun(message: GuildMessage, command: SkyraCommand) {
		// Guarded commands cannot be modified:
		if (command.guarded) return false;
		// Bot-owner commands cannot be modified:
		if (command.permissionLevel === PermissionLevels.BotOwner) return false;
		// If the author is owner of the guild, skip:
		if (isGuildOwner(message.member)) return false;
		// If the author is administrator of the guild, skip:
		if (await isAdmin(message.member)) return false;
		// In any other case, permission nodes should always run:
		return true;
	}
}

export namespace PermissionsPrecondition {
	export type Context = Precondition.Context;
	export type Result = Precondition.Result;
	export type AsyncResult = Precondition.AsyncResult;
	export interface Options extends PreconditionOptions {
		guildOnly?: boolean;
	}
}
