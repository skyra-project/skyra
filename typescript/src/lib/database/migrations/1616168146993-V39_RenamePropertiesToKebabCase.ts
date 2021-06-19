import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V39RenamePropertiesToKebabCase1616168146993 implements MigrationInterface {
	private readonly keys: readonly [previous: string, next: string][] = [
		['disableNaturalPrefix', 'disable-natural-prefix'],
		['disabledCommands', 'disabled-commands'],
		['command-autodelete', 'command-auto-delete'],
		['disabledChannels', 'disabled-channels'],
		['disabledCommandsChannels', 'disabled-commands-channels'],
		['events.banAdd', 'events.ban-add'],
		['events.banRemove', 'events.ban-remove'],
		['events.memberAdd', 'events.member-add'],
		['events.memberRemove', 'events.member-remove'],
		['events.memberRoleUpdate', 'events.member-role-update'],
		['events.messageDelete', 'events.message-delete'],
		['events.messageEdit', 'events.message-edit'],
		['messages.ignoreChannels', 'messages.ignore-channels'],
		['stickyRoles', 'sticky-roles'],
		['roles.removeInitial', 'roles.remove-initial'],
		['roles.uniqueRoleSets', 'roles.unique-role-sets'],
		['selfmod.attachments.ignoredRoles', 'selfmod.attachments.ignored-roles'],
		['selfmod.attachments.ignoredChannels', 'selfmod.attachments.ignored-channels'],
		['selfmod.attachments.softAction', 'selfmod.attachments.soft-action'],
		['selfmod.attachments.hardAction', 'selfmod.attachments.hard-action'],
		['selfmod.attachments.hardActionDuration', 'selfmod.attachments.hard-action-duration'],
		['selfmod.attachments.thresholdMaximum', 'selfmod.attachments.threshold-maximum'],
		['selfmod.attachments.thresholdDuration', 'selfmod.attachments.threshold-duration'],
		['selfmod.capitals.ignoredRoles', 'selfmod.capitals.ignored-roles'],
		['selfmod.capitals.ignoredChannels', 'selfmod.capitals.ignored-channels'],
		['selfmod.capitals.softAction', 'selfmod.capitals.soft-action'],
		['selfmod.capitals.hardAction', 'selfmod.capitals.hard-action'],
		['selfmod.capitals.hardActionDuration', 'selfmod.capitals.hard-action-duration'],
		['selfmod.capitals.thresholdMaximum', 'selfmod.capitals.threshold-maximum'],
		['selfmod.capitals.thresholdDuration', 'selfmod.capitals.threshold-duration'],
		['selfmod.links.ignoredRoles', 'selfmod.links.ignored-roles'],
		['selfmod.links.ignoredChannels', 'selfmod.links.ignored-channels'],
		['selfmod.links.softAction', 'selfmod.links.soft-action'],
		['selfmod.links.hardAction', 'selfmod.links.hard-action'],
		['selfmod.links.hardActionDuration', 'selfmod.links.hard-action-duration'],
		['selfmod.links.thresholdMaximum', 'selfmod.links.threshold-maximum'],
		['selfmod.links.thresholdDuration', 'selfmod.links.threshold-duration'],
		['selfmod.messages.ignoredRoles', 'selfmod.messages.ignored-roles'],
		['selfmod.messages.ignoredChannels', 'selfmod.messages.ignored-channels'],
		['selfmod.messages.softAction', 'selfmod.messages.soft-action'],
		['selfmod.messages.hardAction', 'selfmod.messages.hard-action'],
		['selfmod.messages.hardActionDuration', 'selfmod.messages.hard-action-duration'],
		['selfmod.messages.thresholdMaximum', 'selfmod.messages.threshold-maximum'],
		['selfmod.messages.thresholdDuration', 'selfmod.messages.threshold-duration'],
		['selfmod.newlines.ignoredRoles', 'selfmod.newlines.ignored-roles'],
		['selfmod.newlines.ignoredChannels', 'selfmod.newlines.ignored-channels'],
		['selfmod.newlines.softAction', 'selfmod.newlines.soft-action'],
		['selfmod.newlines.hardAction', 'selfmod.newlines.hard-action'],
		['selfmod.newlines.hardActionDuration', 'selfmod.newlines.hard-action-duration'],
		['selfmod.newlines.thresholdMaximum', 'selfmod.newlines.threshold-maximum'],
		['selfmod.newlines.thresholdDuration', 'selfmod.newlines.threshold-duration'],
		['selfmod.invites.ignoredCodes', 'selfmod.invites.ignored-codes'],
		['selfmod.invites.ignoredGuilds', 'selfmod.invites.ignored-guilds'],
		['selfmod.invites.ignoredRoles', 'selfmod.invites.ignored-roles'],
		['selfmod.invites.ignoredChannels', 'selfmod.invites.ignored-channels'],
		['selfmod.invites.softAction', 'selfmod.invites.soft-action'],
		['selfmod.invites.hardAction', 'selfmod.invites.hard-action'],
		['selfmod.invites.hardActionDuration', 'selfmod.invites.hard-action-duration'],
		['selfmod.invites.thresholdMaximum', 'selfmod.invites.threshold-maximum'],
		['selfmod.invites.thresholdDuration', 'selfmod.invites.threshold-duration'],
		['selfmod.filter.ignoredRoles', 'selfmod.filter.ignored-roles'],
		['selfmod.filter.ignoredChannels', 'selfmod.filter.ignored-channels'],
		['selfmod.filter.softAction', 'selfmod.filter.soft-action'],
		['selfmod.filter.hardAction', 'selfmod.filter.hard-action'],
		['selfmod.filter.hardActionDuration', 'selfmod.filter.hard-action-duration'],
		['selfmod.filter.thresholdMaximum', 'selfmod.filter.threshold-maximum'],
		['selfmod.filter.thresholdDuration', 'selfmod.filter.threshold-duration'],
		['selfmod.reactions.ignoredRoles', 'selfmod.reactions.ignored-roles'],
		['selfmod.reactions.ignoredChannels', 'selfmod.reactions.ignored-channels'],
		['selfmod.reactions.softAction', 'selfmod.reactions.soft-action'],
		['selfmod.reactions.hardAction', 'selfmod.reactions.hard-action'],
		['selfmod.reactions.hardActionDuration', 'selfmod.reactions.hard-action-duration'],
		['selfmod.reactions.thresholdMaximum', 'selfmod.reactions.threshold-maximum'],
		['selfmod.reactions.thresholdDuration', 'selfmod.reactions.threshold-duration'],
		['selfmod.ignoreChannels', 'selfmod.ignored-channels'],
		['no-mention-spam.mentionsAllowed', 'no-mention-spam.mentions-allowed'],
		['no-mention-spam.timePeriod', 'no-mention-spam.time-period'],
		['social.achieveMessage', 'social.achieve-message'],
		['social.ignoreChannels', 'social.ignored-channels'],
		['starboard.ignoreChannels', 'starboard.ignored-channels'],
		['starboard.selfStar', 'starboard.self-star']
	];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const [previous, next] of this.keys) {
			await queryRunner.renameColumn('guilds', previous, next);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const [previous, next] of this.keys) {
			await queryRunner.renameColumn('guilds', next, previous);
		}
	}
}
