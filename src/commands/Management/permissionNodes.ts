import { GuildSettings, PermissionNodeAction } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { GuildMember, Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pnodes', 'pnode'],
	bucket: 2,
	cooldown: 10,
	permissionLevel: PermissionLevels.Administrator,
	description: LanguageKeys.Commands.Management.PermissionNodesDescription,
	extendedHelp: LanguageKeys.Commands.Management.PermissionNodesExtended,
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));
		const action = await args.pick(UserCommand.type);
		const command = await args.pick('command');

		if (!this.checkPermissions(message, target)) throw args.t(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.add(target, command.name, action);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesAdd));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));
		const action = await args.pick(UserCommand.type);
		const command = await args.pick('command');

		if (!this.checkPermissions(message, target)) throw args.t(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.remove(target, command.name, action);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesRemove));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) throw args.t(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.reset(target);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesReset));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) throw args.t(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = await message.guild.readSettings(key);
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') throw args.t(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return message.send([
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowName, {
				name: isRole ? (target as Role).name : (target as GuildMember).displayName
			}),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowAllow, {
				allow: node.allow.length
					? args.t(LanguageKeys.Globals.AndListValue, {
							value: node.allow.map((command) => `\`${command}\``)
					  })
					: args.t(LanguageKeys.Globals.None)
			}),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowDeny, {
				deny: node.deny.length
					? args.t(LanguageKeys.Globals.AndListValue, {
							value: node.deny.map((command) => `\`${command}\``)
					  })
					: args.t(LanguageKeys.Globals.None)
			})
		]);
	}

	private checkPermissions(message: GuildMessage, target: Role | GuildMember) {
		// If it's to itself, always block
		if (message.member!.id === target.id) return false;

		// If the target is the owner, always block
		if (message.guild.ownerID === target.id) return false;

		// If the author is the owner, always allow
		if (message.author.id === message.guild.ownerID) return true;

		// Check hierarchy role positions, allow when greater, block otherwise
		const targetPosition = target instanceof Role ? target.position : target.roles.highest.position;
		const authorPosition = message.member!.roles.highest?.position ?? 0;
		return authorPosition > targetPosition;
	}

	private static type = Args.make<PermissionNodeAction>((parameter, { argument }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'allow') return Args.ok(PermissionNodeAction.Allow);
		if (lowerCasedParameter === 'deny') return Args.ok(PermissionNodeAction.Deny);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Management.PermissionNodesInvalidType });
	});
}
