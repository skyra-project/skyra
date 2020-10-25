import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';
import { GuildMember, Role } from 'discord.js';
import { PermissionsNode, Serializer, SerializerUpdateContext } from '@lib/database';
import { Command } from 'klasa';

export default class extends Serializer {
	public async validate(data: PermissionsNode, { entry, language, entity: { guild } }: SerializerUpdateContext) {
		// Safe-guard checks against arbitrary data
		if (!isObject(data)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (Object.keys(data).length !== 3) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (typeof data.id !== 'string') throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(data.allow)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(data.deny)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.name === 'roles') {
			const role = guild.roles.cache.get(data.id);
			if (!role) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			target = role;
		} else {
			target = await guild.members.fetch(data.id).catch(() => {
				throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && data.allow.length !== 0) {
			throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityEveryoneAllows);
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityOwner);
		}

		// Check all commands
		const commands = new Map<string, Command>();
		for (const allowed of data.allow) {
			if (commands.has(allowed)) throw language.get(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: allowed });

			const command = this.client.commands.get(allowed);
			if (!command) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			if (command.permissionLevel >= 9) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			commands.set(allowed, command);
		}

		for (const denied of data.deny) {
			if (commands.has(denied)) throw language.get(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: denied });

			const command = this.client.commands.get(denied);
			if (!command) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.permissionLevel >= 9) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.guarded) throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityGuarded, { command: denied });
			commands.set(denied, command);
		}

		return data;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}
}
