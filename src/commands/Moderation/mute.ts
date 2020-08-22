import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { Role } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['m'],
	description: (language) => language.get('COMMAND_MUTE_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_MUTE_EXTENDED'),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = message.guild.settings.get(GuildSettings.Roles.Muted);
		const role = (id && message.guild.roles.get(id)) || null;
		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))) throw message.language.get('COMMAND_MUTE_LOWLEVEL');
			if (await message.ask(message.language.get('ACTION_SHARED_ROLE_SETUP_EXISTING'))) {
				const [role] = (await this.rolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(message.language.get('ACTION_SHARED_ROLE_SETUP_EXISTING_NAME'))) as [Role];
				await message.guild.settings.update(GuildSettings.Roles.Muted, role, {
					extraContext: { author: message.author.id }
				});
			} else if (await message.ask(message.language.get('ACTION_SHARED_ROLE_SETUP_NEW'))) {
				await message.guild.security.actions.muteSetup(message);
				await message.sendLocale('COMMAND_SUCCESS');
			} else {
				await message.sendLocale('MONITOR_COMMAND_HANDLER_ABORTED');
			}
		}

		return false;
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.mute(
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
