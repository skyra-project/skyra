import { readSettings, writeSettings, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation/structures/ModerationCommand';
import type { GuildMessage } from '#lib/types';
import type { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { getSecurity, isAdmin, promptConfirmation, promptForMessage } from '#utils/functions';
import type { Argument } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Nullish } from '@sapphire/utilities';
import type { Role } from 'discord.js';

export abstract class SetUpModerationCommand extends ModerationCommand {
	public readonly roleKey: GuildSettingsOfType<string | undefined | null>;
	public readonly setUpKey: ModerationSetupRestriction;

	public constructor(context: ModerationCommand.Context, options: SetUpModerationCommand.Options) {
		super(context, options);
		this.roleKey = options.roleKey;
		this.setUpKey = options.setUpKey;
	}

	private get role() {
		return this.container.stores.get('arguments').get('role') as Argument<Role>;
	}

	public override async messageRun(
		message: GuildMessage,
		args: ModerationCommand.Args,
		context: ModerationCommand.RunContext
	): Promise<GuildMessage | null> {
		await this.inhibit(message, args, context);
		return super.messageRun(message, args, context);
	}

	public async inhibit(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.RunContext) {
		// If the command messageRun is not this one (potentially help command) or the guild is null, return with no error.
		const [id, t] = await readSettings(message.guild, (settings) => [settings[this.roleKey], settings.getLanguage()]);

		// Verify for role existence.
		const role = (id && message.guild.roles.cache.get(id)) ?? null;
		if (role) return undefined;

		// If there
		if (!(await isAdmin(message.member!))) {
			this.error(LanguageKeys.Commands.Moderation.RestrictLowlevel);
		}

		if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const role = (await this.askForRole(message, args, context)).unwrapRaw();
			await writeSettings(message.guild, [[this.roleKey, role.id]]);
		} else if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await getSecurity(message.guild).actions.restrictionSetup(message, this.setUpKey);

			const content = t(LanguageKeys.Commands.Moderation.Success);
			await send(message, content);
		} else {
			this.error(LanguageKeys.Commands.Management.CommandHandlerAborted);
		}

		return undefined;
	}

	protected async askForRole(message: GuildMessage, args: SetUpModerationCommand.Args, context: SetUpModerationCommand.RunContext) {
		const result = await promptForMessage(message, args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName));
		if (result === null) this.error(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNoMessage);

		const argument = this.role;
		return argument.run(result, { args, argument, command: this, commandContext: context, message });
	}
}

export namespace SetUpModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options extends ModerationCommand.Options {
		roleKey: GuildSettingsOfType<string | Nullish>;
		setUpKey: ModerationSetupRestriction;
	}

	export type Args = ModerationCommand.Args;
	export type Context = ModerationCommand.Context;
	export type RunContext = ModerationCommand.RunContext;
}
