import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: Command) {
		// If the message was sent in a guild, the command isn't guarded (they are all 0, and
		// cannot be denied), and the permission level is lower than 9, run the permission nodes.
		if (message.guild && !command.guarded && command.permissionLevel < 9) {
			if (this.runUser(message, command) === false) return false;
			if (this.runRole(message, command) === false) return false;
		}

		const { broke, permission } = await this.client.permissionLevels.run(message, command.permissionLevel);
		if (!permission) throw broke ? message.language.get('INHIBITOR_PERMISSIONS') : true;
	}

	private runUser(message: KlasaMessage, command: Command) {
		const { author } = message;
		if (!author) return null;

		// Assume sorted data
		const permissionNodeRoles = message.guild!.settings.get(GuildSettings.Permissions.Users) as GuildSettings.Permissions.Users;
		for (const node of permissionNodeRoles) {
			if (node.id !== author.id) continue;
			if (node.allow.includes(command.name)) return false;
			if (node.deny.includes(command.name)) throw message.language.get('INHIBITOR_PERMISSIONS');
		}

		return null;
	}

	private runRole(message: KlasaMessage, command: Command) {
		const { member } = message;
		if (!member) return null;

		// Assume sorted data
		const permissionNodeRoles = message.guild!.settings.get(GuildSettings.Permissions.Roles) as GuildSettings.Permissions.Roles;
		for (const node of permissionNodeRoles) {
			if (!member.roles.has(node.id)) continue;
			if (node.allow.includes(command.name)) return false;
			if (node.deny.includes(command.name)) throw message.language.get('INHIBITOR_PERMISSIONS');
		}

		return null;
	}

}
