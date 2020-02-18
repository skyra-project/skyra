import { ModerationCommand } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends ModerationCommand {

	private readonly kPath = GuildSettings.Roles.RestrictedReaction;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['un-restricted-reaction', 'urr'],
			description: language => language.tget('COMMAND_UNRESTRICTREACTION_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNRESTRICTREACTION_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = message.guild.settings.get(this.kPath);
		if (id && message.guild.roles.has(id)) return false;
		throw message.language.tget('GUILD_SETTINGS_ROLES_RESTRICTED', message.guild.settings.get(GuildSettings.Prefix), this.kPath);
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null) {
		return message.guild!.security.actions.unRestrictReaction({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
