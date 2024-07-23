import { PermissionNodeAction, readSettings, writeSettings, type PermissionsNode } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { resolveOnErrorCodes } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, Role, type GuildMember } from 'discord.js';

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['pnodes', 'pnode'],
	permissionLevel: PermissionLevels.Administrator,
	description: LanguageKeys.Commands.Management.PermissionNodesDescription,
	detailedDescription: LanguageKeys.Commands.Management.PermissionNodesExtended,
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
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
		await writeSettings(message.guild, (settings) => ({
			[settings.permissionNodes.settingsPropertyFor(target)]: settings.permissionNodes.add(target, command, action)
		}));

		const content = args.t(LanguageKeys.Commands.Management.PermissionNodesAdd);
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));
		const action = await args.pick(UserCommand.type);
		const command = await args.pick('commandMatch', { owners: false });

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await writeSettings(message.guild, (settings) => ({
			[settings.permissionNodes.settingsPropertyFor(target)]: settings.permissionNodes.remove(target, command, action)
		}));

		const content = args.t(LanguageKeys.Commands.Management.PermissionNodesRemove);
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);

		await writeSettings(message.guild, (settings) => ({
			[settings.permissionNodes.settingsPropertyFor(target)]: settings.permissionNodes.reset(target)
		}));

		const content = args.t(LanguageKeys.Commands.Management.PermissionNodesReset);
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const content = args.finished ? await this.showAll(message, args) : await this.showOne(message, args);
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	private async showOne(message: GuildMessage, args: SkyraSubcommand.Args) {
		const target = await args.pick('roleName').catch(() => args.pick('member'));

		if (!this.checkPermissions(message, target)) this.error(LanguageKeys.Commands.Management.PermissionNodesHigher);
		const isRole = target instanceof Role;

		const settings = await readSettings(message.guild);
		const nodes = isRole ? settings.permissionsRoles : settings.permissionsUsers;
		const node = nodes.find((n) => n.id === target.id);
		if (typeof node === 'undefined') this.error(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return this.formatPermissionNode(args, node, isRole, target);
	}

	private async showAll(message: GuildMessage, args: SkyraSubcommand.Args) {
		const settings = await readSettings(message.guild);
		const [users, roles] = await Promise.all([
			this.formatPermissionNodes(args, settings.permissionsUsers, false),
			this.formatPermissionNodes(args, settings.permissionsRoles, true)
		]);
		const total = users.concat(roles);
		if (total.length === 0) this.error(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		return total.join('\n\n');
	}

	private async formatPermissionNodes(args: SkyraSubcommand.Args, nodes: readonly PermissionsNode[], isRole: boolean) {
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

	private formatPermissionNode(args: SkyraSubcommand.Args, node: PermissionsNode, isRole: boolean, target: Role | GuildMember) {
		return [
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowName, { name: this.formatTarget(isRole, target) }),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowAllow, { allow: this.formatCommands(args, node.allow) }),
			args.t(LanguageKeys.Commands.Management.PermissionNodesShowDeny, { deny: this.formatCommands(args, node.deny) })
		].join('\n');
	}

	private formatTarget(isRole: boolean, target: Role | GuildMember) {
		return isRole ? (target as Role).name : (target as GuildMember).displayName;
	}

	private formatCommands(args: SkyraSubcommand.Args, commands: readonly string[]) {
		return commands.length === 0
			? args.t(LanguageKeys.Globals.None)
			: args.t(LanguageKeys.Globals.AndListValue, { value: commands.map((command) => `\`${command}\``) });
	}

	private checkPermissions(message: GuildMessage, target: Role | GuildMember) {
		// If it's to itself, always block
		if (message.member!.id === target.id) return false;

		// If the target is the owner, always block
		if (message.guild.ownerId === target.id) return false;

		// If the author is the owner, always allow
		if (message.author.id === message.guild.ownerId) return true;

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
