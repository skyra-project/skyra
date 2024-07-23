import { writeSettingsTransaction, type StickyRole, type UniqueRoleSet } from '#lib/database';
import { Listener } from '@sapphire/framework';
import { filter, map, toArray } from '@sapphire/iterator-utilities';
import type { Role } from 'discord.js';

export class UserListener extends Listener {
	public async run(role: Role) {
		if (!role.guild.available) return;

		await using trx = await writeSettingsTransaction(role);

		trx.write({ stickyRoles: this.#filterStickyRoles(trx.settings.stickyRoles, role) });
		trx.write({ rolesUniqueRoleSets: this.#filterUniqueRoleSets(trx.settings.rolesUniqueRoleSets, role) });

		trx.write({ reactionRoles: trx.settings.reactionRoles.filter((rr) => rr.role !== role.id) });
		trx.write({ rolesModerator: trx.settings.rolesModerator.filter((rm) => rm !== role.id) });
		trx.write({ rolesAdmin: trx.settings.rolesAdmin.filter((rm) => rm !== role.id) });
		trx.write({ rolesPublic: trx.settings.rolesPublic.filter((rm) => rm !== role.id) });

		trx.write({ selfmodAttachmentsIgnoredRoles: trx.settings.selfmodAttachmentsIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodCapitalsIgnoredRoles: trx.settings.selfmodCapitalsIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodLinksIgnoredRoles: trx.settings.selfmodLinksIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodMessagesIgnoredRoles: trx.settings.selfmodMessagesIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodNewlinesIgnoredRoles: trx.settings.selfmodNewlinesIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodInvitesIgnoredRoles: trx.settings.selfmodInvitesIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodFilterIgnoredRoles: trx.settings.selfmodFilterIgnoredRoles.filter((rm) => rm !== role.id) });
		trx.write({ selfmodReactionsIgnoredRoles: trx.settings.selfmodReactionsIgnoredRoles.filter((rm) => rm !== role.id) });

		if (trx.settings.rolesInitial === role.id) trx.write({ rolesInitial: null });
		if (trx.settings.rolesInitialHumans === role.id) trx.write({ rolesInitialHumans: null });
		if (trx.settings.rolesInitialBots === role.id) trx.write({ rolesInitialBots: null });
		if (trx.settings.rolesMuted === role.id) trx.write({ rolesMuted: null });
		if (trx.settings.rolesRestrictedReaction === role.id) trx.write({ rolesRestrictedReaction: null });
		if (trx.settings.rolesRestrictedEmbed === role.id) trx.write({ rolesRestrictedEmbed: null });
		if (trx.settings.rolesRestrictedEmoji === role.id) trx.write({ rolesRestrictedEmoji: null });
		if (trx.settings.rolesRestrictedAttachment === role.id) trx.write({ rolesRestrictedAttachment: null });
		if (trx.settings.rolesRestrictedVoice === role.id) trx.write({ rolesRestrictedVoice: null });

		if (trx.settings.permissionNodes.has(role.id)) {
			trx.write({ permissionsRoles: trx.settings.permissionNodes.refresh() });
		}

		await trx.submit();
	}

	#filterStickyRoles(roles: readonly StickyRole[], role: Role) {
		const mapped = map(roles, (entry): StickyRole => ({ user: entry.user, roles: entry.roles.filter((srr) => srr !== role.id) }));
		const filtered = filter(mapped, (entry) => entry.roles.length > 0);
		return toArray(filtered);
	}

	#filterUniqueRoleSets(roles: readonly UniqueRoleSet[], role: Role) {
		const mapped = map(roles, (entry): UniqueRoleSet => ({ name: entry.name, roles: entry.roles.filter((urs) => urs !== role.id) }));
		const filtered = filter(mapped, (entry) => entry.roles.length > 0);
		return toArray(filtered);
	}
}
