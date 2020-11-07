import { PermissionsNode } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { GuildMember, Role } from 'discord.js';
import { Command } from 'klasa';

type Nodes = readonly PermissionsNode[];

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pnodes', 'pnode'],
	bucket: 2,
	cooldown: 10,
	permissionLevel: PermissionLevels.Administrator,
	description: (language) => language.get(LanguageKeys.Commands.Management.PermissionNodesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.PermissionNodesExtended),
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
			throw await message.fetchLocale(LanguageKeys.Commands.Management.PermissionNodesInvalidType);
		}
	]
])
export default class extends SkyraCommand {
	public async add(message: GuildMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw await message.fetchLocale(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		await message.guild.writeSettings((settings) => {
			const nodes = settings[key];
			const nodeIndex = nodes.findIndex((n) => n.id === target.id);

			if (nodeIndex === -1) {
				const node: Nodes[number] = {
					id: target.id,
					allow: action === 'allow' ? [command.name] : [],
					deny: action === 'deny' ? [command.name] : []
				};

				settings[key] = [node];
			} else {
				const previous = nodes[nodeIndex];
				const node: Nodes[number] = {
					id: target.id,
					allow: previous.allow.concat(action === 'allow' ? [command.name] : []),
					deny: previous.deny.concat(action === 'deny' ? [command.name] : [])
				};

				settings[key].splice(nodeIndex, 1, node);
			}
		});

		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesAdd);
	}

	public async remove(message: GuildMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw await message.fetchLocale(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		await message.guild.writeSettings((settings) => {
			const nodes = settings[key];
			const language = settings.getLanguage();
			const nodeIndex = nodes.findIndex((n) => n.id === target.id);
			if (nodeIndex === -1) throw language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

			const previous = nodes[nodeIndex];
			const commandIndex = previous[action].indexOf(command.name);
			if (commandIndex === -1) throw language.get(LanguageKeys.Commands.Management.PermissionNodesCommandNotExists);

			const node: Nodes[number] = {
				id: target.id,
				allow: action === 'allow' ? previous.allow.slice() : previous.allow,
				deny: action === 'deny' ? previous.deny.slice() : previous.deny
			};
			node[action].splice(commandIndex, 1);

			settings[key].splice(nodeIndex, 1, node);
		});

		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesRemove);
	}

	public async reset(message: GuildMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw await message.fetchLocale(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		await message.guild.writeSettings((settings) => {
			const nodes = settings[key];
			const nodeIndex = nodes.findIndex((n) => n.id === target.id);
			const language = settings.getLanguage();

			if (nodeIndex === -1) throw language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

			settings[key].splice(nodeIndex, 1);
		});

		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesReset);
	}

	public async show(message: GuildMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw await message.fetchLocale(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const { nodes, language } = await message.guild.readSettings((settings) => ({
			nodes: settings[key],
			language: settings.getLanguage()
		}));
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') throw language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return message.send([
			language.get(LanguageKeys.Commands.Management.PermissionNodesShowName, {
				name: isRole ? (target as Role).name : (target as GuildMember).displayName
			}),
			language.get(LanguageKeys.Commands.Management.PermissionNodesShowAllow, {
				allow: node.allow.length
					? language.list(
							node.allow.map((command) => `\`${command}\``),
							language.get(LanguageKeys.Globals.And)
					  )
					: language.get(LanguageKeys.Globals.None)
			}),
			language.get(LanguageKeys.Commands.Management.PermissionNodesShowDeny, {
				deny: node.deny.length
					? language.list(
							node.deny.map((command) => `\`${command}\``),
							language.get(LanguageKeys.Globals.And)
					  )
					: language.get(LanguageKeys.Globals.None)
			})
		]);
	}

	private checkPermissions(message: GuildMessage, target: Role | GuildMember) {
		// If it's to itself, always block
		if (message.member!.id === target.id) return false;

		// If the target is the owner, always block
		if (message.guild!.ownerID === target.id) return false;

		// If the author is the owner, always allow
		if (message.author.id === message.guild!.ownerID) return true;

		// Check hierarchy role positions, allow when greater, block otherwise
		const targetPosition = target instanceof Role ? target.position : target.roles.highest.position;
		const authorPosition = message.member!.roles.highest?.position ?? 0;
		return authorPosition > targetPosition;
	}
}
