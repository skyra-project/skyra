import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings, PermissionsNode } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { GuildMember, Role } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';

type Nodes = readonly PermissionsNode[];

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pnodes', 'pnode'],
			bucket: 2,
			cooldown: 10,
			permissionLevel: PermissionLevels.Administrator,
			description: (language) => language.get(LanguageKeys.Commands.Management.PermissionNodesDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.PermissionNodesExtended),
			subcommands: true,
			usage: '<add|remove|reset|show:default> <role:rolename{2}|user:membername> (type:type) (command:command)',
			usageDelim: ' '
		});

		this.createCustomResolver('command', (arg, possible, message, [action]: string[]) => {
			if (action === 'reset' || action === 'show') return undefined;
			return this.client.arguments.get('command')!.run(arg, possible, message);
		}).createCustomResolver('type', (arg, _possible, message, [action]: string[]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (/allow|deny/i.test(arg)) return arg.toLowerCase();
			throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesInvalidType);
		});
	}

	public async add(message: KlasaMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key);
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);
		if (nodeIndex === -1) {
			const node: Nodes[number] = {
				id: target.id,
				allow: action === 'allow' ? [command.name] : [],
				deny: action === 'deny' ? [command.name] : []
			};
			await message.guild!.settings.update(key, node, {
				extraContext: { author: message.author.id }
			});
		} else {
			const previous = nodes[nodeIndex];
			const node: Nodes[number] = {
				id: target.id,
				allow: previous.allow.concat(action === 'allow' ? [command.name] : []),
				deny: previous.deny.concat(action === 'deny' ? [command.name] : [])
			};
			await message.guild!.settings.update(key, node, {
				arrayIndex: nodeIndex,
				extraContext: { author: message.author.id }
			});
		}

		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesAdd);
	}

	public async remove(message: KlasaMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key);
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);
		if (nodeIndex === -1) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		const previous = nodes[nodeIndex];
		const commandIndex = previous[action].indexOf(command.name);
		if (commandIndex === -1) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesCommandNotExists);

		const node: Nodes[number] = {
			id: target.id,
			allow: action === 'allow' ? previous.allow.slice() : previous.allow,
			deny: action === 'deny' ? previous.deny.slice() : previous.deny
		};
		node[action].splice(commandIndex, 1);

		await message.guild!.settings.update(key, node, {
			arrayIndex: nodeIndex,
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesRemove);
	}

	public async reset(message: KlasaMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key);
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);
		if (nodeIndex === -1) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		const clone = nodes.slice();
		clone.splice(nodeIndex, 1);
		await message.guild!.settings.update(key, clone, {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.PermissionNodesReset);
	}

	public show(message: KlasaMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key);
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') throw message.language.get(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return message.send([
			message.language.get(LanguageKeys.Commands.Management.PermissionNodesShowName, {
				name: isRole ? (target as Role).name : (target as GuildMember).displayName
			}),
			message.language.get(LanguageKeys.Commands.Management.PermissionNodesShowAllow, {
				allow: node.allow.length
					? message.language.list(
							node.allow.map((command) => `\`${command}\``),
							message.language.get(LanguageKeys.Globals.And)
					  )
					: message.language.get(LanguageKeys.Globals.None)
			}),
			message.language.get(LanguageKeys.Commands.Management.PermissionNodesShowDeny, {
				deny: node.deny.length
					? message.language.list(
							node.deny.map((command) => `\`${command}\``),
							message.language.get(LanguageKeys.Globals.And)
					  )
					: message.language.get(LanguageKeys.Globals.None)
			})
		]);
	}

	private checkPermissions(message: KlasaMessage, target: Role | GuildMember) {
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
