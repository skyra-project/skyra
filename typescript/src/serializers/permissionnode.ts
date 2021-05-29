import { CommandMatcher, PermissionsNode, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { CommandStore, UserError } from '@sapphire/framework';
import { isObject } from '@sapphire/utilities';
import type { GuildMember, Role } from 'discord.js';

export class UserSerializer extends Serializer<PermissionsNode> {
	public parse(_: Serializer.Args, { t }: SerializerUpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public async isValid(value: PermissionsNode, { entry, guild }: SerializerUpdateContext): Promise<boolean> {
		// Safe-guard checks against arbitrary data
		if (!isObject(value)) throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalid });
		if (Object.keys(value).length !== 3) throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalid });
		if (typeof value.id !== 'string') throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalid });
		if (!Array.isArray(value.allow)) throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalid });
		if (!Array.isArray(value.deny)) throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalid });

		// Check for target validity
		let target: GuildMember | Role | undefined = undefined;
		if (entry.name === 'permissionsRoles') {
			const role = guild.roles.cache.get(value.id);
			if (!role) throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalidTarget });
			target = role;
		} else {
			target = await guild.members.fetch(value.id).catch(() => {
				throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalidTarget });
			});
		}

		// The @everyone role should not have allows
		if (target.id === guild.id && value.allow.length !== 0) {
			throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeSecurityEveryoneAllows });
		}

		// The owner cannot have allows nor denies
		if (target.id === guild.ownerID) {
			throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeSecurityOwner });
		}

		// Check all commands
		const commands = this.context.stores.get('commands');
		const checked = new Set<string>();
		for (const allowed of value.allow) {
			if (checked.has(allowed))
				throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, context: { command: allowed } });

			const match = CommandMatcher.resolve(allowed);
			if (match === null || !this.validCommand(commands, match)) {
				throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalidCommand, context: { command: allowed } });
			}
			checked.add(match);
		}

		for (const denied of value.deny) {
			if (checked.has(denied))
				throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, context: { command: denied } });

			const match = CommandMatcher.resolve(denied);
			if (match === null || !this.validCommand(commands, match)) {
				throw new UserError({ identifier: LanguageKeys.Serializers.PermissionNodeInvalidCommand, context: { command: denied } });
			}
			checked.add(match);
		}

		return true;
	}

	public stringify(value: PermissionsNode) {
		return `${value.id}(${value.allow.join(', ')} | ${value.deny.join(', ')})`;
	}

	private validCommand(commands: CommandStore, name: string) {
		const command = commands.get(name) as SkyraCommand | undefined;

		// No command means it matched a group, which is fine:
		if (command === undefined) return true;

		// If it matched a command, it must not be a bot-owner one:
		return command.permissionLevel < PermissionLevels.BotOwner;
	}
}
