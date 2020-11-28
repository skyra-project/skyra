import { PermissionsNode, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';
import { GuildMember, Role } from 'discord.js';
import { Command } from 'klasa';

export default class UserSerializer extends Serializer<PermissionsNode> {
	public parse(_: string, context: SerializerUpdateContext) {
		return this.error(context.language.get(LanguageKeys.Serializers.Unsupported));
	}

	public async isValid(value: PermissionsNode, { language, entry, entity: { guild } }: SerializerUpdateContext): Promise<boolean> {
		// Safe-guard checks against arbitrary data
		if (!isObject(value)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (Object.keys(value).length !== 3) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (typeof value.id !== 'string') throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(value.allow)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);
		if (!Array.isArray(value.deny)) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalid);

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.name === 'permissionsRoles') {
			const role = guild.roles.cache.get(value.id);
			if (!role) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			target = role;
		} else {
			target = await guild.members.fetch(value.id).catch(() => {
				throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidTarget);
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && value.allow.length !== 0) {
			throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityEveryoneAllows);
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityOwner);
		}

		// Check all commands
		const commands = new Map<string, Command>();
		for (const allowed of value.allow) {
			if (commands.has(allowed)) throw language.get(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: allowed });

			const command = this.client.commands.get(allowed);
			if (!command) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			if (command.permissionLevel >= 9) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: allowed });
			commands.set(allowed, command);
		}

		for (const denied of value.deny) {
			if (commands.has(denied)) throw language.get(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command: denied });

			const command = this.client.commands.get(denied);
			if (!command) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.permissionLevel >= 9) throw language.get(LanguageKeys.Serializers.PermissionNodeInvalidCommand, { command: denied });
			if (command.guarded) throw language.get(LanguageKeys.Serializers.PermissionNodeSecurityGuarded, { command: denied });
			commands.set(denied, command);
		}

		return true;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}
}
