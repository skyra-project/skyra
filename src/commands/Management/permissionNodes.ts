import { CommandStore, KlasaMessage, Command } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Role, GuildMember } from 'discord.js';
import { GuildSettings, PermissionsNode } from '../../lib/types/settings/GuildSettings';

type Nodes = readonly PermissionsNode[];

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pnodes', 'pnode'],
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_PERMISSIONNODES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PERMISSIONNODES_EXTENDED'),
			subcommands: true,
			usage: '<add|remove|reset|show:default> <role:rolename{2}|user:membername> (type:type) (command:command)',
			usageDelim: ' '
		});

		this.createCustomResolver('command', (arg, possible, message, [action]: string[]) => {
			if (action === 'reset' || action === 'show') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		}).createCustomResolver('type', (arg, _possible, message, [action]: string[]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (/allow|deny/i.test(arg)) return arg.toLowerCase();
			throw message.language.tget('COMMAND_PERMISSIONNODES_INVALID_TYPE');
		});
	}

	public async add(message: KlasaMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw message.language.tget('COMMAND_PERMISSIONNODES_HIGHER');
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key) as Nodes;
		const nodeIndex = nodes.findIndex(n => n.id === target.id);
		if (nodeIndex === -1) {
			const node: Nodes[number] = {
				id: target.id,
				allow: action === 'allow' ? [command.name] : [],
				deny: action === 'deny' ? [command.name] : []
			};
			await message.guild!.settings.update(key, node, { throwOnError: true });
		} else {
			const previous = nodes[nodeIndex];
			const node: Nodes[number] = {
				id: target.id,
				allow: previous.allow.concat(action === 'allow' ? [command.name] : []),
				deny: previous.deny.concat(action === 'deny' ? [command.name] : [])
			};
			await message.guild!.settings.update(key, node, { throwOnError: true, arrayIndex: nodeIndex });
		}

		return message.sendLocale('COMMAND_PERMISSIONNODES_ADD');
	}

	public async remove(message: KlasaMessage, [target, action, command]: [Role | GuildMember, 'allow' | 'deny', Command]) {
		if (!this.checkPermissions(message, target)) throw message.language.tget('COMMAND_PERMISSIONNODES_HIGHER');
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key) as Nodes;
		const nodeIndex = nodes.findIndex(n => n.id === target.id);
		if (nodeIndex === -1) throw message.language.tget('COMMAND_PERMISSIONNODES_NODE_NOT_EXISTS');

		const previous = nodes[nodeIndex];
		const commandIndex = previous[action].indexOf(command.name);
		if (commandIndex === -1) throw message.language.tget('COMMAND_PERMISSIONNODES_COMMAND_NOT_EXISTS');

		const node: Nodes[number] = {
			id: target.id,
			allow: action === 'allow' ? previous.allow.slice() : previous.allow,
			deny: action === 'deny' ? previous.deny.slice() : previous.deny
		};
		node[action].splice(commandIndex, 1);

		await message.guild!.settings.update(key, node, { throwOnError: true, arrayIndex: nodeIndex });
		return message.sendLocale('COMMAND_PERMISSIONNODES_REMOVE');
	}

	public async reset(message: KlasaMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw message.language.tget('COMMAND_PERMISSIONNODES_HIGHER');
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key) as Nodes;
		const nodeIndex = nodes.findIndex(n => n.id === target.id);
		if (nodeIndex === -1) throw message.language.tget('COMMAND_PERMISSIONNODES_NODE_NOT_EXISTS');

		const clone = nodes.slice();
		clone.splice(nodeIndex, 1);
		await message.guild!.settings.update(key, clone, { throwOnError: true, arrayAction: 'overwrite' });
		return message.sendLocale('COMMAND_PERMISSIONNODES_RESET');
	}

	public show(message: KlasaMessage, [target]: [Role | GuildMember]) {
		if (!this.checkPermissions(message, target)) throw message.language.tget('COMMAND_PERMISSIONNODES_HIGHER');
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = message.guild!.settings.get(key) as Nodes;
		const node = nodes.find(n => n.id === target.id);
		if (typeof node === 'undefined') throw message.language.tget('COMMAND_PERMISSIONNODES_NODE_NOT_EXISTS');

		return message.sendLocale('COMMAND_PERMISSIONNODES_SHOW', [
			isRole ? (target as Role).name : (target as GuildMember).displayName,
			node.allow.map(command => `\`${command}\``),
			node.deny.map(command => `\`${command}\``)
		]);
	}

	private checkPermissions(message: KlasaMessage, target: Role | GuildMember) {
		// If it's to itself, always block
		if (message.member === target) return false;

		// If the target is the owner, always block
		if (message.guild!.ownerID === target.id) return false;

		// If the author is the owner, always allow
		if (message.author!.id === message.guild!.ownerID) return true;

		// Check hierarchy role positions, allow when greater, block otherwise
		return message.member!.roles.highest.position > (target instanceof Role ? target.position : target.roles.highest.position);
	}

}
