import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { Permissions, TextChannel, PermissionString } from 'discord.js';
import { SkyraCommand } from '../lib/structures/SkyraCommand';

export default class extends Inhibitor {

	// VIEW_CHANNEL, SEND_MESSAGES, SEND_TTS_MESSAGES, EMBED_LINKS, ATTACH_FILES,
	// READ_MESSAGE_HISTORY, MENTION_EVERYONE, USE_EXTERNAL_EMOJIS, ADD_REACTIONS
	private impliedPermissions = new Permissions(515136).freeze();

	public run(message: KlasaMessage, command: Command) {
		let missing: PermissionString[];

		// If the message was sent in a guild channel, check for channel permissions.
		if (message.guild) {
			const textChannel = message.channel as TextChannel;
			const permissions = textChannel.permissionsFor(message.guild.me!);
			if (!permissions) throw 'Failed to fetch permissions.';
			missing = permissions.missing(command.requiredPermissions, false);

			// The extension, SkyraCommand, includes requiredGuildPermissions, which checks for permissions
			// in the guild scope. This is done since there are channel overrides that do not affect guild-level
			// permissions, for instance, `MANAGE_ROLES`.
			if (command instanceof SkyraCommand && command.requiredGuildPermissions.bitfield !== 0) {
				const guildPermissions = message.guild.me!.permissions;
				missing = [...new Set(guildPermissions.missing(command.requiredGuildPermissions, false))];
			}
		} else {
			// If it's in a DM, use the implied permissions.
			missing = this.impliedPermissions.missing(command.requiredPermissions, false);
		}

		if (missing.length) {
			const permissions = message.language.PERMISSIONS;
			throw message.language.tget('INHIBITOR_MISSING_BOT_PERMS', missing.map(permission => permissions[permission]).join(', '));
		}
	}

}
