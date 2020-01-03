import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { PermissionLevels } from '../../lib/types/Enums';
import { User, Role } from 'discord.js';
import { ModerationSetupRestriction } from '../../lib/util/Security/ModerationActions';

export default class extends ModerationCommand {

	private rolePrompt = this.definePrompt('<role:rolename>');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['restricted-reaction', 'rr'],
			description: language => language.tget('COMMAND_RESTRICTREACTION_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_RESTRICTREACTION_EXTENDED'),
			optionalDuration: true,
			requiredMember: true,
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public async inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = message.guild.settings.get(GuildSettings.Roles.RestrictedReaction);
		const role = (id && message.guild!.roles.get(id)) || null;
		if (!role) {
			if (!await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)) throw message.language.tget('COMMAND_RESTRICT_LOWLEVEL');
			if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING'))) {
				const [role] = await this.rolePrompt.createPrompt(message, { time: 30000, limit: 1 }).run(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING_NAME')) as [Role];
				await message.guild.settings.update(GuildSettings.Roles.RestrictedReaction, role);
			} else if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_NEW'))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Reaction);
				await message.sendLocale('COMMAND_SUCCESS');
			} else {
				await message.sendLocale('MONITOR_COMMAND_HANDLER_ABORTED');
			}
		}

		return false;
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, target: User, reason: string, duration: number | null) {
		return message.guild!.security.actions.restrictReaction({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
