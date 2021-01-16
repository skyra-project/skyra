import { PermissionsNode, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isObject } from '@sapphire/utilities';
import type { GuildMember, Role } from 'discord.js';
import type { Command } from 'klasa';

export default class UserSerializer extends Serializer<PermissionsNode> {
	public parse(_: string, context: SerializerUpdateContext) {
		return this.error(context.t(LanguageKeys.Serializers.Unsupported));
	}

	public async isValid(value: PermissionsNode, { t, entry, guild }: SerializerUpdateContext): Promise<boolean> {
		// Safe-guard checks against arbitrary data
		if (!isObject(value)) throw t(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (Object.keys(value).length !== 3) throw t(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (typeof value.id !== 'string') throw t(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(value.allow)) throw t(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(value.deny)) throw t(LanguageKeys.Serializers.PermissionNodeInvalid);

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.name === 'permissionsRoles') {
			const role = guild.roles.cache.get(value.id);
			if (!role) throw t(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			target = role;
		} else {
			target = await guild.members.fetch(value.id).catch(() => {
				throw t(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && value.allow.length !== 0) {
			throw t(LanguageKeys.Serializers.PermissionNodeSecurityEveryoneAllows);
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw t(LanguageKeys.Serializers.PermissionNodeSecurityOwner);
		}

		// Check all commands
		const commands = new Map<string, Command>();
		for (const allowed of value.allow) {
			if (commands.has(allowed)) throw t(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: allowed });

			const command = this.client.commands.get(allowed);
			if (!command) throw t(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			if (command.permissionLevel >= 9) throw t(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			commands.set(allowed, command);
		}

		for (const denied of value.deny) {
			if (commands.has(denied)) throw t(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: denied });

			const command = this.client.commands.get(denied);
			if (!command) throw t(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.permissionLevel >= 9) throw t(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.guarded) throw t(LanguageKeys.Serializers.PermissionNodeSecurityGuarded, { command: denied });
			commands.set(denied, command);
		}

		return true;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}
}
