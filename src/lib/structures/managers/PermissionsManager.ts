import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { PermissionsNode } from '@lib/database/entities/GuildEntity';
import { Guild, Role } from 'discord.js';

const sort = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

export class PermissionsManager extends Map<string, PermissionsManagerNode> {
	public guild: Guild;

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public async fetchRawNodes() {
		return this.guild.readSettings(GuildSettings.Permissions.Roles);
	}

	public async update(rawNodes?: PermissionsNode[]) {
		rawNodes ??= await this.fetchRawNodes();

		if (rawNodes.length === 0) {
			this.clear();
			return this;
		}

		// Generate sorted data and detect useless nodes to remove
		const { pendingToAdd, pendingToRemove } = this.generateSorted(rawNodes);

		// Set up everything
		this.clear();
		for (const pending of pendingToAdd) {
			this.set(pending.id, {
				allow: new Set(pending.allow),
				deny: new Set(pending.deny)
			});
		}

		// Delete redundant entries
		if (pendingToRemove.length) {
			await this.guild.writeSettings((settings) => {
				const roles = settings[GuildSettings.Permissions.Roles];
				for (const removedItem of pendingToRemove) {
					const removedIndex = roles.findIndex((element) => element.id === removedItem.id);
					if (removedIndex !== -1) roles.splice(removedIndex, 1);
				}
			});
		}

		return this;
	}

	private generateSorted(rawNodes: readonly PermissionsNode[]) {
		const sortedRoles = [...this.guild.roles.cache.values()].sort(sort);
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
}

export interface PermissionsManagerNode {
	allow: Set<string>;
	deny: Set<string>;
}
