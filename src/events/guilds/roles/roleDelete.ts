import type { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(role: Role) {
		if (!role.guild.available) return;

		return role.guild.writeSettings((settings) => {
			for (const stickyRole of settings.stickyRoles) {
				stickyRole.roles = stickyRole.roles.filter((srr) => srr !== role.id);
			}

			settings.stickyRoles = settings.stickyRoles.filter((sr) => Boolean(sr.roles.length));

			for (const uniqueRoleSet of settings.rolesUniqueRoleSets) {
				uniqueRoleSet.roles = uniqueRoleSet.roles.filter((urs) => urs !== role.id);
			}

			settings.rolesUniqueRoleSets = settings.rolesUniqueRoleSets.filter((sr) => Boolean(sr.roles.length));

			settings.reactionRoles = settings.reactionRoles.filter((rr) => rr.role !== role.id);
			settings.rolesAuto = settings.rolesAuto.filter((ra) => ra.id !== role.id);
			settings.rolesModerator = settings.rolesModerator.filter((rm) => rm !== role.id);
			settings.rolesAdmin = settings.rolesAdmin.filter((rm) => rm !== role.id);
			settings.rolesPublic = settings.rolesPublic.filter((rm) => rm !== role.id);
			settings.rolesDj = settings.rolesDj.filter((rm) => rm !== role.id);

			settings.selfmodAttachmentsIgnoredRoles = settings.selfmodAttachmentsIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodCapitalsIgnoredRoles = settings.selfmodCapitalsIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodLinksIgnoredRoles = settings.selfmodLinksIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodMessagesIgnoredRoles = settings.selfmodMessagesIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodNewlinesIgnoredRoles = settings.selfmodNewlinesIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodInvitesIgnoredRoles = settings.selfmodInvitesIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodFilterIgnoredRoles = settings.selfmodFilterIgnoredRoles.filter((rm) => rm !== role.id);
			settings.selfmodReactionsIgnoredRoles = settings.selfmodReactionsIgnoredRoles.filter((rm) => rm !== role.id);

			if (settings.rolesInitial === role.id) settings.rolesInitial = null;
			if (settings.rolesMuted === role.id) settings.rolesMuted = null;

			if (settings.rolesRestrictedReaction === role.id) settings.rolesRestrictedReaction = null;
			if (settings.rolesRestrictedEmbed === role.id) settings.rolesRestrictedEmbed = null;

			if (settings.rolesRestrictedEmoji === role.id) settings.rolesRestrictedEmoji = null;
			if (settings.rolesRestrictedAttachment === role.id) settings.rolesRestrictedAttachment = null;

			if (settings.rolesRestrictedVoice === role.id) settings.rolesRestrictedVoice = null;
			if (settings.rolesSubscriber === role.id) settings.rolesSubscriber = null;

			if (this.context.client.settings.guilds.get(role.guild.id)?.permissionNodes.has(role.id)) {
				settings.permissionNodes.refresh();
			}
		});
	}
}
