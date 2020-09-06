import { PermissionsNode } from '@lib/types/settings/GuildSettings';
import { isObject } from '@sapphire/utilities';
import { GuildMember, Role } from 'discord.js';
import { Command, Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public async validate(data: PermissionsNode, { entry, language, guild }: SerializerUpdateContext) {
		if (guild === null) throw new TypeError('guild must not be null.');

		// Safe-guard checks against arbitrary data
		if (!isObject(data)) throw language.get('serializerPermissionNodeInvalid');
		if (Object.keys(data).length !== 3) throw language.get('serializerPermissionNodeInvalid');
		if (typeof data.id !== 'string') throw language.get('serializerPermissionNodeInvalid');
		if (!Array.isArray(data.allow)) throw language.get('serializerPermissionNodeInvalid');
		if (!Array.isArray(data.deny)) throw language.get('serializerPermissionNodeInvalid');

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.key === 'roles') {
			const role = guild.roles.cache.get(data.id);
			if (!role) throw language.get('serializerPermissionNodeInvalidTarget');
			target = role;
		} else {
			target = await guild.members.fetch(data.id).catch(() => {
				throw language.get('serializerPermissionNodeInvalidTarget');
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && data.allow.length !== 0) {
			throw language.get('serializerPermissionNodeSecurityEveryoneAllows');
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw language.get('serializerPermissionNodeSecurityOwner');
		}

		// Check all commands
		const commands = new Map<string, Command>();
		for (const allowed of data.allow) {
			if (commands.has(allowed)) throw language.get('serializerPermissionNodeDuplicatedCommand', { command: allowed });

			const command = this.client.commands.get(allowed);
			if (!command) throw language.get('serializerPermissionNodeInvalidCommand', { command: allowed });
			if (command.permissionLevel >= 9) throw language.get('serializerPermissionNodeInvalidCommand', { command: allowed });
			commands.set(allowed, command);
		}

		for (const denied of data.deny) {
			if (commands.has(denied)) throw language.get('serializerPermissionNodeDuplicatedCommand', { command: denied });

			const command = this.client.commands.get(denied);
			if (!command) throw language.get('serializerPermissionNodeInvalidCommand', { command: denied });
			if (command.permissionLevel >= 9) throw language.get('serializerPermissionNodeInvalidCommand', { command: denied });
			if (command.guarded) throw language.get('serializerPermissionNodeSecurityGuarded', { command: denied });
			commands.set(denied, command);
		}

		return data;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}
}
