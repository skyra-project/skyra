import { GuildEntity, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { getSecurity, isAdmin, promptConfirmation, promptForMessage } from '#utils/functions';
import type { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import type { Argument, PieceContext } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { PickByValue } from '@sapphire/utilities';
import type { Role } from 'discord.js';
import { ModerationCommand } from './ModerationCommand';

export abstract class SetUpModerationCommand extends ModerationCommand {
	public readonly roleKey: PickByValue<GuildEntity, string | undefined | null>;
	public readonly setUpKey: ModerationSetupRestriction;

	public constructor(context: PieceContext, options: SetUpModerationCommand.Options) {
		super(context, options);
		this.roleKey = options.roleKey;
		this.setUpKey = options.setUpKey;
	}

	private get role() {
		return this.container.stores.get('arguments').get('role') as Argument<Role>;
	}

	public async messageRun(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.Context): Promise<GuildMessage | null> {
		await this.inhibit(message, args, context);
		return super.messageRun(message, args, context);
	}

	public async inhibit(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.Context) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		const [id, t] = await readSettings(message.guild, (settings) => [settings[this.roleKey], settings.getLanguage()]);

		// Verify for role existence.
		const role = (id && message.guild.roles.cache.get(id)) ?? null;
		if (role) return undefined;

		// If there
		if (!(await isAdmin(message.member!))) {
			this.error(LanguageKeys.Commands.Moderation.RestrictLowlevel);
		}

		if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const role = await this.askForRole(message, args, context);
			if (!role.success) return this.error(role.error);
			await writeSettings(message.guild, [[this.roleKey, role.value.id]]);
		} else if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await getSecurity(message.guild).actions.restrictionSetup(message, this.setUpKey);

			const content = t(LanguageKeys.Commands.Moderation.Success);
			await send(message, content);
		} else {
			this.error(LanguageKeys.Commands.Management.CommandHandlerAborted);
		}

		return undefined;
	}

	protected async askForRole(message: GuildMessage, args: SetUpModerationCommand.Args, context: SetUpModerationCommand.Context) {
		const result = await promptForMessage(message, args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName));
		if (result === null) this.error(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNoMessage);

		const argument = this.role;
		return argument.run(result, { args, argument, command: this, commandContext: context, message });
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SetUpModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options extends ModerationCommand.Options {
		roleKey: PickByValue<GuildEntity, string | undefined | null>;
		setUpKey: ModerationSetupRestriction;
	}

	export type Args = ModerationCommand.Args;
	export type Context = ModerationCommand.Context;
}
