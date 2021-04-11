import type { GuildEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage, KeyOfType } from '#lib/types';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { Argument, PieceContext } from '@sapphire/framework';
import type { Role } from 'discord.js';
import { ModerationCommand } from './ModerationCommand';

export abstract class SetUpModerationCommand extends ModerationCommand {
	public readonly roleKey: KeyOfType<GuildEntity, string | undefined | null>;
	public readonly setUpKey: ModerationSetupRestriction;

	public constructor(context: PieceContext, options: SetUpModerationCommand.Options) {
		super(context, options);
		this.roleKey = options.roleKey;
		this.setUpKey = options.setUpKey;
	}

	private get role() {
		return this.context.stores.get('arguments').get('role') as Argument<Role>;
	}

	public async run(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.Context): Promise<GuildMessage | null> {
		await this.inhibit(message, args, context);
		return super.run(message, args, context);
	}

	public async inhibit(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.Context) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		const [id, t] = await message.guild.readSettings((settings) => [settings[this.roleKey], settings.getLanguage()]);

		// Verify for role existence.
		const role = (id && message.guild.roles.cache.get(id)) ?? null;
		if (role) return undefined;

		// If there
		if (!(await message.member!.isAdmin())) {
			this.error(LanguageKeys.Commands.Moderation.RestrictLowlevel);
		}

		if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const role = await this.askForRole(message, args, context);
			if (!role.success) return this.error(role.error);
			await message.guild.writeSettings([[this.roleKey, role.value.id]]);
		} else if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild.security.actions.restrictionSetup(message, this.setUpKey);
			await message.send(t(LanguageKeys.Commands.Moderation.Success));
		} else {
			await message.send(t(LanguageKeys.Commands.Management.CommandHandlerAborted));
		}

		return undefined;
	}

	protected async askForRole(message: GuildMessage, args: SetUpModerationCommand.Args, context: SetUpModerationCommand.Context) {
		const response = await message.prompt(args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName), 30000).catch(() => null);
		if (response === null) return this.error(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNoMessage);

		const argument = this.role;
		return argument.run(response.content, { args, argument, command: this, commandContext: context, message });
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SetUpModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options extends ModerationCommand.Options {
		roleKey: KeyOfType<GuildEntity, string | undefined | null>;
		setUpKey: ModerationSetupRestriction;
	}

	export type Args = ModerationCommand.Args;
	export type Context = ModerationCommand.Context;
}
