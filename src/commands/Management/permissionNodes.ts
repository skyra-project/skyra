import { GuildSettings, PermissionNodeAction, PermissionsNode } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
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

		// Permission Nodes do not allow allows for the @everyone role:
		if (target.id === message.guild.id && action === PermissionNodeAction.Allow) {
			this.error(LanguageKeys.Commands.Management.PermissionNodesCannotAllowEveryone);
		}

		if (!this.checkPermissions(message, target)) {
			this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);
		}

		const command = await args.pick('commandMatch', { owners: false });
		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.add(target, command, action);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesAdd));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));
		const action = await args.pick(UserCommand.type);
		const command = await args.pick('commandMatch', { owners: false });

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.remove(target, command, action);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesRemove));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await message.guild.writeSettings((settings) => {
			settings.permissionNodes.reset(target);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.PermissionNodesReset));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.finished ? await this.showAll(message, args) : await this.showOne(message, args);
		return message.send(content, { allowedMentions: { users: [], roles: [] } });
	}

	private async showOne(message: GuildMessage, args: SkyraCommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;
		const key = isRole ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = await message.guild.readSettings(key);
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') this.error(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return this.formatPermissionNode(args, node, isRole, target);
	}

	private async showAll(message: GuildMessage, args: SkyraCommand.Args) {
		const [users, roles] = await message.guild.readSettings([GuildSettings.Permissions.Users, GuildSettings.Permissions.Roles]);
		const [fUsers, fRoles] = await Promise.all([this.formatPermissionNodes(args, users, false), this.formatPermissionNodes(args, roles, true)]);
		const total = fUsers.concat(fRoles);
		if (total.length === 0) this.error(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return total.join('\n\n');
	}

	private async formatPermissionNodes(args: SkyraCommand.Args, nodes: readonly PermissionsNode[], isRole: boolean) {
		const output: string[] = [];
		for (const node of nodes) {
			const target = isRole
				? args.message.guild!.roles.cache.get(node.id)
				: await resolveOnErrorCodes(args.message.guild!.members.fetch(node.id), RESTJSONErrorCodes.UnknownMember);

			if (isNullish(target)) continue;
			if (!this.checkPermissions(args.message as GuildMessage, target)) continue;
			output.push(`> ${this.formatPermissionNode(args, node, isRole, target)}`);
		}

		return output;
	}

	private formatPermissionNode(args: SkyraCommand.Args, node: PermissionsNode, isRole: boolean, target: Role | GuildMember) {
		return [
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowName, { name: this.formatTarget(isRole, target) }),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowAllow, { allow: this.formatCommands(args, node.allow) }),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowDeny, { deny: this.formatCommands(args, node.deny) })
		].join('\n');
	}

	private formatTarget(isRole: boolean, target: Role | GuildMember) {
		return isRole ? (target as Role).name : (target as GuildMember).displayName;
	}

	private formatCommands(args: SkyraCommand.Args, commands: readonly string[]) {
		return commands.length === 0
			? args.t(LanguageKeys.Globals.None)
			: args.t(LanguageKeys.Globals.AndListValue, { value: commands.map((command) => `\`${command}\``) });
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
