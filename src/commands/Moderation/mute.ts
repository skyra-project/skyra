import { GuildSettings } from '@lib/database';
import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { Role } from 'discord.js';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['m'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.MuteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.MuteExtended),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async inhibit(message: GuildMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;

		const id = await message.guild.readSettings(GuildSettings.Roles.Muted);
		const role = (id && message.guild.roles.cache.get(id)) || null;

		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))) {
				throw await message.fetchLocale(LanguageKeys.Commands.Moderation.MuteLowlevel);
			}

			const language = await message.fetchLanguage();
			if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
				const [role] = (await this.rolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

				await message.guild.writeSettings([[GuildSettings.Roles.Muted, role.id]]);
			} else if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
				await message.guild.security.actions.muteSetup(message);
				await message.sendLocale(LanguageKeys.Misc.CommandSuccess);
			} else {
				await message.sendLocale(LanguageKeys.Monitors.CommandHandlerAborted);
			}
		}

		return false;
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.mute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
