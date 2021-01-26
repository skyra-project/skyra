import type { GuildEntity, PermissionsNode } from '#lib/database/entities/GuildEntity';
import { GuildSettings } from '#lib/database/keys';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import Collection from '@discordjs/collection';
import { Store } from '@sapphire/framework';
import { arrayStrictEquals } from '@sapphire/utilities';
import { GuildMember, Role, User } from 'discord.js';
import type { IBaseManager } from '../base/IBaseManager';

const sort = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

export const enum PermissionNodeAction {
	Allow,
	Deny
}

type Nodes = readonly PermissionsNode[];
type Node = Nodes[number];

export class PermissionNodeManager implements IBaseManager {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#settings: GuildEntity;
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#sorted = new Collection<string, PermissionsManagerNode>();
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#previous: Nodes = [];

	public constructor(settings: GuildEntity) {
		this.#settings = settings;
	}

	public get client() {
		return Store.injectedContext.client;
	}

	public run(member: GuildMember, command: string) {
		return this.runUser(member, command) ?? this.runRole(member, command);
	}

	public has(roleID: string) {
		return this.#sorted.has(roleID);
	}

	public add(target: Role | GuildMember | User, command: string, action: PermissionNodeAction) {
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = this.#settings[key];
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);

		if (nodeIndex === -1) {
			const node: Node = {
				id: target.id,
				allow: action === PermissionNodeAction.Allow ? [command] : [],
				deny: action === PermissionNodeAction.Deny ? [command] : []
			};

			this.#settings[key].push(node);
		} else {
			const previous = nodes[nodeIndex];
			if (
				(action === PermissionNodeAction.Allow && previous.allow.includes(command)) ||
				(action === PermissionNodeAction.Deny && previous.deny.includes(command))
			) {
				const t = this.#settings.getLanguage();
				throw t(LanguageKeys.Serializers.PermissionNodeDuplicatedCommand, { command });
			}

			const node: Node = {
				id: target.id,
				allow: action === PermissionNodeAction.Allow ? previous.allow.concat(command) : previous.allow,
				deny: action === PermissionNodeAction.Deny ? previous.deny.concat(command) : previous.deny
			};

			this.#settings[key][nodeIndex] = node;
		}
	}

	public remove(target: Role | GuildMember | User, command: string, action: PermissionNodeAction) {
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = this.#settings[key];
		const t = this.#settings.getLanguage();
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);
		if (nodeIndex === -1) throw t(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);

		const property = this.getName(action);
		const previous = nodes[nodeIndex];
		const commandIndex = previous[property].indexOf(command);
		if (commandIndex === -1) throw t(LanguageKeys.Commands.Management.PermissionNodesCommandNotExists);

		const node: Nodes[number] = {
			id: target.id,
			allow: 'allow' ? previous.allow.slice() : previous.allow,
			deny: 'deny' ? previous.deny.slice() : previous.deny
		};
		node[property].splice(commandIndex, 1);

		this.#settings[key].splice(nodeIndex, 1, node);
	}

	public reset(target: Role | GuildMember | User) {
		const key = target instanceof Role ? GuildSettings.Permissions.Roles : GuildSettings.Permissions.Users;

		const nodes = this.#settings[key];
		const nodeIndex = nodes.findIndex((n) => n.id === target.id);

		if (nodeIndex === -1) {
			const t = this.#settings.getLanguage();
			throw t(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);
		}

		this.#settings[key].splice(nodeIndex, 1);
	}

	public refresh() {
		const nodes = this.#settings[GuildSettings.Permissions.Roles];
		this.#previous = nodes;

		if (nodes.length === 0) {
			this.#sorted.clear();
			return;
		}

		// Generate sorted data and detect useless nodes to remove
		const { pendingToAdd, pendingToRemove } = this.generateSorted(nodes);

		// Set up everything
		const sorted = new Collection<string, PermissionsManagerNode>();
		for (const pending of pendingToAdd) {
			sorted.set(pending.id, {
				allow: new Set(pending.allow),
				deny: new Set(pending.deny)
			});
		}

		this.#sorted = sorted;

		// Delete redundant entries
		if (pendingToRemove.length) {
			for (const removedItem of pendingToRemove) {
				const removedIndex = nodes.findIndex((element) => element.id === removedItem.id);
				if (removedIndex !== -1) nodes.splice(removedIndex, 1);
			}
		}
	}

	public onPatch() {
		const nodes = this.#settings[GuildSettings.Permissions.Roles];
		if (!arrayStrictEquals(this.#previous, nodes)) this.refresh();
	}

	public onRemove(): void {
		this.#sorted.clear();
		this.#previous = [];
	}

	private runUser(member: GuildMember, command: string) {
		// Assume sorted data
		const permissionNodeRoles = this.#settings.permissionsUsers;
		const memberID = member.id;
		for (const node of permissionNodeRoles) {
			if (node.id !== memberID) continue;
			if (node.allow.includes(command)) return true;
			if (node.deny.includes(command)) return false;
		}

		return null;
	}

	private runRole(member: GuildMember, command: string) {
		const roles = member.roles.cache;

		// Assume sorted data
		for (const [id, node] of this.#sorted.entries()) {
			if (!roles.has(id)) continue;
			if (node.allow.has(command)) return true;
			if (node.deny.has(command)) return false;
		}

		return null;
	}

	private generateSorted(rawNodes: readonly PermissionsNode[]) {
		const sortedRoles = [...this.#settings.guild.roles.cache.values()].sort(sort);
		const nodes = rawNodes.slice();

		const sortedNodes: PermissionsNode[] = [];
		for (const sortedRole of sortedRoles) {
			const index = nodes.findIndex((node) => node.id === sortedRole.id);
			if (index === -1) continue;

			sortedNodes.push(nodes[index]);
			nodes.splice(index, 1);
		}

		return {
			pendingToAdd: sortedNodes,
			pendingToRemove: nodes
		};
	}

	private getName(type: PermissionNodeAction) {
		switch (type) {
			case PermissionNodeAction.Allow:
				return 'allow';
			case PermissionNodeAction.Deny:
				return 'deny';
			default:
				throw new Error('Unreachable');
		}
	}
}

interface PermissionsManagerNode {
	allow: Set<string>;
	deny: Set<string>;
}
