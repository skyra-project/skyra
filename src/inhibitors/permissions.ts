import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: Command) {
		// If the message was sent in a guild, the command isn't guarded (they are all 0, and
		// cannot be denied), and the permission level is lower than 9, run the permission nodes.
		if (message.guild && message.author.id !== message.guild.ownerID && !command.guarded && command.permissionLevel < 9) {
			if (this.runUser(message, command) === false) return false;
			if (this.runRole(message, command) === false) return false;
		}

		const { broke, permission } = await this.client.permissionLevels.run(message, command.permissionLevel);
		if (!permission) throw broke ? message.language.tget('INHIBITOR_PERMISSIONS') : true;
	}

	private runUser(message: KlasaMessage, command: Command) {
		const { author } = message;
		if (!author) return null;

		// Assume sorted data
		const permissionNodeRoles = message.guild!.settings.get(GuildSettings.Permissions.Users);
		for (const node of permissionNodeRoles) {
			if (node.id !== author.id) continue;
			if (node.allow.includes(command.name)) return false;
			if (node.deny.includes(command.name)) throw message.language.tget('INHIBITOR_PERMISSIONS');
		}

		return null;
	}

	private runRole(message: KlasaMessage, command: Command) {
		const { member } = message;
		if (!member) return null;

		// Assume sorted data
		for (const [id, node] of message.guild!.permissionsManager.entries()) {
			if (!member.roles.has(id)) continue;
			if (node.allow.has(command.name)) return false;
			if (node.deny.has(command.name)) throw message.language.tget('INHIBITOR_PERMISSIONS');
		}

		return null;
	}

}
