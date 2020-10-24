import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Command, Inhibitor } from 'klasa';

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
	public async run(message: GuildMessage, command: Command) {
		// TODO(kyranet): Move all the permission node stuff to a class.

		// If the message was sent in a guild, the command isn't guarded (they are all 0, and
		// cannot be denied), and the permission level is lower than 9, run the permission nodes.
		if (message.guild && message.author.id !== message.guild.ownerID && !command.guarded && command.permissionLevel < 9) {
			if (await this.checkUser(message, command)) return;
			if (await this.checkRole(message, command)) return;
		}

		const { broke, permission } = await this.client.permissionLevels.run(message, command.permissionLevel);
		if (!permission) throw broke ? message.fetchLocale(LanguageKeys.Inhibitors.Permissions) : true;
	}

	private async checkUser(message: GuildMessage, command: Command) {
		return this.checkPermissionNodeResult(message, await this.runUser(message, command));
	}

	private async checkRole(message: GuildMessage, command: Command) {
		return this.checkPermissionNodeResult(message, await this.runRole(message, command));
	}

	private async runUser(message: GuildMessage, command: Command) {
		// Assume sorted data
		const permissionNodeRoles = await message.guild.readSettings((entity) => entity.permissionsUsers);
		for (const node of permissionNodeRoles) {
			if (node.id !== message.author.id) continue;
			if (node.allow.includes(command.name)) return PermissionNodeResult.Allow;
			if (node.deny.includes(command.name)) return PermissionNodeResult.Disallow;
		}

		return PermissionNodeResult.NoMatch;
	}

	private runRole(message: GuildMessage, command: Command) {
		const { member } = message;
		if (!member) return PermissionNodeResult.Uncached;

		// TODO(kyranet): this might not be filled.

		// Assume sorted data
		for (const [id, node] of message.guild.permissionsManager.entries()) {
			if (!member.roles.cache.has(id)) continue;
			if (node.allow.has(command.name)) return PermissionNodeResult.Allow;
			if (node.deny.has(command.name)) return PermissionNodeResult.Disallow;
		}

		return PermissionNodeResult.NoMatch;
	}

	private async checkPermissionNodeResult(message: GuildMessage, result: PermissionNodeResult) {
		switch (result) {
			case PermissionNodeResult.Uncached:
				return false;
			case PermissionNodeResult.Allow:
				return true;
			case PermissionNodeResult.Disallow:
				throw await message.fetchLocale(LanguageKeys.Inhibitors.Permissions);
			case PermissionNodeResult.NoMatch:
				return false;
		}
	}
}
