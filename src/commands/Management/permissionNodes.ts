import { GuildSettings, PermissionNodeAction } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { GuildMember, Role } from 'discord.js';
import { Command } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pnodes', 'pnode'],
	bucket: 2,
	cooldown: 10,
	permissionLevel: PermissionLevels.Administrator,
	description: LanguageKeys.Commands.Management.PermissionNodesDescription,
	extendedHelp: LanguageKeys.Commands.Management.PermissionNodesExtended,
	subcommands: true,
	runIn: ['text'],
	usage: '<add|remove|reset|show:default> <role:rolename{2}|user:membername> (type:type) (command:command)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'command',
		(arg, possible, message, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			return message.client.arguments.get('command')!.run(arg, possible, message);
		}
	],
	[
		'type',
		async (arg, _possible, message, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (/allow|deny/i.test(arg)) return arg.toLowerCase();
			throw await message.resolveKey(LanguageKeys.Commands.Management.PermissionNodesInvalidType);
		}
	]
])
export default class extends SkyraCommand {
	public async add(message: GuildMessage, [target, action, command]: [Role | GuildMember, PermissionNodeAction, Command]) {
		if (!this.checkPermissions(message, target)) throw await message.resolveKey(LanguageKeys.Commands.Management.PermissionNodesHigher);

		const t = await message.guild.writeSettings((settings) => {
			settings.permissionNodes.add(target, command.name, action);
			return settings.getLanguage();
		});

		return message.send(t(LanguageKeys.Commands.Management.PermissionNodesAdd));
	}

	public async remove(message: GuildMessage, [target, action, command]: [Role | GuildMember, PermissionNodeAction, Command]) {
		if (!this.checkPermissions(message, target)) throw await message.resolveKey(LanguageKeys.Commands.Management.PermissionNodesHigher);

		const t = await message.guild.writeSettings((settings) => {
			settings.permissionNodes.remove(target, command.name, action);
			return settings.getLanguage();
		});

		return message.send(t(LanguageKeys.Commands.Management.PermissionNodesRemove));
	}

	public async reset(message: GuildMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw await message.resolveKey(LanguageKeys.Commands.Management.PermissionNodesHigher);

		const t = await message.guild.writeSettings((settings) => {
			settings.permissionNodes.reset(target);
			return settings.getLanguage();
		});

		return message.send(t(LanguageKeys.Commands.Management.PermissionNodesReset));
	}

	public async show(message: GuildMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw await message.resolveKey(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const [nodes, t] = await message.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') throw t(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return message.send([
			t(LanguageKeys.Commands.Management.PermissionNodesShowName, {
				name: isRole ? (target as Role).name : (target as GuildMember).displayName
			}),
			t(LanguageKeys.Commands.Management.PermissionNodesShowAllow, {
				allow: node.allow.length
					? t(LanguageKeys.Globals.AndListValue, {
							value: node.allow.map((command) => `\`${command}\``)
					  })
					: t(LanguageKeys.Globals.None)
			}),
			t(LanguageKeys.Commands.Management.PermissionNodesShowDeny, {
				deny: node.deny.length
					? t(LanguageKeys.Globals.AndListValue, {
							value: node.deny.map((command) => `\`${command}\``)
					  })
					: t(LanguageKeys.Globals.None)
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
}
