import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Command, Inhibitor, KlasaMessage } from 'klasa';

const enum PermissionNodeResult {
	/**
	 * The data was not received from Discord.
	 */
	Uncached,

	/**
	 * There is an applicable PermissionNode for the message's user and the usage is allowed.
	 */
	Allow,

	/**
	 * There is an applicable PermissionNode for the message's user and the usage is denied.
	 */
	Disallow,

	/**
	 * There is no applicable PermissionNode for the message's user.
	 */
	NoMatch
}

export default class extends Inhibitor {
	public async run(message: KlasaMessage, command: Command) {
		// If the message was sent in a guild, the command isn't guarded (they are all 0, and
		// cannot be denied), and the permission level is lower than 9, run the permission nodes.
		if (message.guild && message.author.id !== message.guild.ownerID && !command.guarded && command.permissionLevel < 9) {
			if (this.checkUser(message, command)) return;
			if (this.checkRole(message, command)) return;
		}

		const { broke, permission } = await this.client.permissionLevels.run(message, command.permissionLevel);
		if (!permission) throw broke ? message.language.get('inhibitorPermissions') : true;
	}

	private checkUser(message: KlasaMessage, command: Command) {
		return this.checkPermissionNodeResult(message, this.runUser(message, command));
	}

	private checkRole(message: KlasaMessage, command: Command) {
		return this.checkPermissionNodeResult(message, this.runRole(message, command));
	}

	private runUser(message: KlasaMessage, command: Command) {
		// Assume sorted data
		const permissionNodeRoles = message.guild!.settings.get(GuildSettings.Permissions.Users);
		for (const node of permissionNodeRoles) {
			if (node.id !== message.author.id) continue;
			if (node.allow.includes(command.name)) return PermissionNodeResult.Allow;
			if (node.deny.includes(command.name)) return PermissionNodeResult.Disallow;
		}

		return PermissionNodeResult.NoMatch;
	}

	private runRole(message: KlasaMessage, command: Command) {
		const { member } = message;
		if (!member) return PermissionNodeResult.Uncached;

		// Assume sorted data
		for (const [id, node] of message.guild!.permissionsManager.entries()) {
			if (!member.roles.cache.has(id)) continue;
			if (node.allow.has(command.name)) return PermissionNodeResult.Allow;
			if (node.deny.has(command.name)) return PermissionNodeResult.Disallow;
		}

		return PermissionNodeResult.NoMatch;
	}

	private checkPermissionNodeResult(message: KlasaMessage, result: PermissionNodeResult) {
		switch (result) {
			case PermissionNodeResult.Uncached:
				return false;
			case PermissionNodeResult.Allow:
				return true;
			case PermissionNodeResult.Disallow:
				throw message.language.get('inhibitorPermissions');
			case PermissionNodeResult.NoMatch:
				return false;
		}
	}
}
