import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { ModerationSetupRestriction } from '@utils/Security/ModerationActions';
import { ArgumentTypes } from '@utils/util';
import { Role } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['restricted-voice', 'rv'],
	description: language => language.tget('COMMAND_RESTRICTVOICE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_RESTRICTVOICE_EXTENDED'),
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
		const id = message.guild.settings.get(GuildSettings.Roles.RestrictedVoice);
		const role = (id && message.guild.roles.get(id)) || null;
		if (!role) {
			if (!await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)) throw message.language.tget('COMMAND_RESTRICT_LOWLEVEL');
			if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING'))) {
				const [role] = await this.rolePrompt.createPrompt(message, { time: 30000, limit: 1 }).run(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING_NAME')) as [Role];
				await message.guild.settings.update(GuildSettings.Roles.RestrictedVoice, role, {
					extraContext: { author: message.author.id }
				});
			} else if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_NEW'))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Voice);
				await message.sendLocale('COMMAND_SUCCESS');
			} else {
				await message.sendLocale('MONITOR_COMMAND_HANDLER_ABORTED');
			}
		}

		return false;
	}

	public async prehandle() { /* Do nothing */ }

	public handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.restrictVoice({
			user_id: context.target.id,
			moderator_id: message.author.id,
			duration: context.duration,
			reason: context.reason
		}, this.getTargetDM(message, context.target));
	}

	public async posthandle() { /* Do nothing */ }

}
