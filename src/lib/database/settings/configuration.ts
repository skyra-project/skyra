import { SchemaGroup, type NonEmptyArray } from '#lib/database/settings/schema/SchemaGroup';
import { SchemaKey, type ConfigurableKeyValueOptions } from '#lib/database/settings/schema/SchemaKey';
import type { GuildDataKey } from '#lib/database/settings/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { years } from '#utils/common';
import { objectEntries } from '@sapphire/utilities';
import { Collection } from 'discord.js';

export const configurableKeys = new Collection<GuildDataKey, SchemaKey>();
export const configurableGroups = new SchemaGroup();

export const Configuration = makeKeys({
	prefix: {
		type: 'string',
		description: LanguageKeys.Settings.Prefix,
		minimum: 1,
		maximum: 10,
		default: process.env.CLIENT_PREFIX
	},
	language: {
		type: 'language',
		description: LanguageKeys.Settings.Language,
		default: 'en-US'
	},
	disableNaturalPrefix: {
		name: 'disable-natural-prefix',
		type: 'boolean',
		description: LanguageKeys.Settings.DisableNaturalPrefix,
		default: false
	},
	disabledCommands: {
		name: 'disabled-commands',
		type: 'commandMatch',
		description: LanguageKeys.Settings.DisabledCommands,
		maximum: 32,
		array: true
	},
	permissionsUsers: {
		type: 'permissionNode',
		name: 'permissions.users',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	permissionsRoles: {
		type: 'permissionNode',
		name: 'permissions.roles',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	channelsMediaOnly: {
		type: 'guildTextChannel',
		name: 'channels.media-only',
		description: LanguageKeys.Settings.Channels.MediaOnly,
		array: true
	},
	channelsLogsModeration: {
		type: 'guildTextChannel',
		name: 'channels.logs.moderation',
		description: LanguageKeys.Settings.Channels.Logs.Moderation
	},
	channelsLogsImage: {
		type: 'guildTextChannel',
		name: 'channels.logs.image',
		description: LanguageKeys.Settings.Channels.Logs.Image
	},
	channelsLogsMemberAdd: {
		type: 'guildTextChannel',
		name: 'channels.logs.member-add',
		description: LanguageKeys.Settings.Channels.Logs.MemberAdd
	},
	channelsLogsMemberRemove: {
		type: 'guildTextChannel',
		name: 'channels.logs.member-remove',
		description: LanguageKeys.Settings.Channels.Logs.MemberRemove
	},
	channelsLogsMemberNickNameUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.member-nickname-update',
		description: LanguageKeys.Settings.Channels.Logs.MemberNickNameUpdate
	},
	channelsLogsMemberUserNameUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.member-username-update',
		description: LanguageKeys.Settings.Channels.Logs.MemberUserNameUpdate
	},
	channelsLogsMemberRolesUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.member-roles-update',
		description: LanguageKeys.Settings.Channels.Logs.MemberRoleUpdate
	},
	channelsLogsMessageDelete: {
		type: 'guildTextChannel',
		name: 'channels.logs.message-delete',
		description: LanguageKeys.Settings.Channels.Logs.MessageDelete
	},
	channelsLogsMessageDeleteNsfw: {
		type: 'guildTextChannel',
		name: 'channels.logs.message-delete-nsfw',
		description: LanguageKeys.Settings.Channels.Logs.MessageDeleteNsfw
	},
	channelsLogsMessageUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.message-update',
		description: LanguageKeys.Settings.Channels.Logs.MessageUpdate
	},
	channelsLogsMessageUpdateNsfw: {
		type: 'guildTextChannel',
		name: 'channels.logs.message-update-nsfw',
		description: LanguageKeys.Settings.Channels.Logs.MessageUpdateNsfw
	},
	channelsLogsPrune: {
		type: 'guildTextChannel',
		name: 'channels.logs.prune',
		description: LanguageKeys.Settings.Channels.Logs.Prune
	},
	channelsLogsReaction: {
		type: 'guildTextChannel',
		name: 'channels.logs.reaction',
		description: LanguageKeys.Settings.Channels.Logs.Reaction
	},
	channelsLogsRoleCreate: {
		type: 'guildTextChannel',
		name: 'channels.logs.role-create',
		description: LanguageKeys.Settings.Channels.Logs.RoleCreate
	},
	channelsLogsRoleUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.role-update',
		description: LanguageKeys.Settings.Channels.Logs.RoleUpdate
	},
	channelsLogsRoleDelete: {
		type: 'guildTextChannel',
		name: 'channels.logs.role-delete',
		description: LanguageKeys.Settings.Channels.Logs.RoleDelete
	},
	channelsLogsChannelCreate: {
		type: 'guildTextChannel',
		name: 'channels.logs.channel-create',
		description: LanguageKeys.Settings.Channels.Logs.ChannelCreate
	},
	channelsLogsChannelUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.channel-update',
		description: LanguageKeys.Settings.Channels.Logs.ChannelUpdate
	},
	channelsLogsChannelDelete: {
		type: 'guildTextChannel',
		name: 'channels.logs.channel-delete',
		description: LanguageKeys.Settings.Channels.Logs.ChannelDelete
	},
	channelsLogsEmojiCreate: {
		type: 'guildTextChannel',
		name: 'channels.logs.emoji-create',
		description: LanguageKeys.Settings.Channels.Logs.EmojiCreate
	},
	channelsLogsEmojiUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.emoji-update',
		description: LanguageKeys.Settings.Channels.Logs.EmojiUpdate
	},
	channelsLogsEmojiDelete: {
		type: 'guildTextChannel',
		name: 'channels.logs.emoji-delete',
		description: LanguageKeys.Settings.Channels.Logs.EmojiDelete
	},
	channelsLogsServerUpdate: {
		type: 'guildTextChannel',
		name: 'channels.logs.server-update',
		description: LanguageKeys.Settings.Channels.Logs.ServerUpdate
	},
	channelsLogsVoiceChannel: {
		type: 'guildTextChannel',
		name: 'channels.logs.voice-activity',
		description: LanguageKeys.Settings.Channels.Logs.VoiceActivity
	},
	channelsIgnoreAll: {
		type: 'guildTextChannel',
		name: 'channels.ignore.all',
		description: LanguageKeys.Settings.Channels.Ignore.All,
		array: true
	},
	channelsIgnoreMessageEdits: {
		type: 'guildTextChannel',
		name: 'channels.ignore.message-edit',
		description: LanguageKeys.Settings.Channels.Ignore.MessageEdit,
		array: true
	},
	channelsIgnoreMessageDeletes: {
		type: 'guildTextChannel',
		name: 'channels.ignore.message-delete',
		description: LanguageKeys.Settings.Channels.Ignore.MessageDelete,
		array: true
	},
	channelsIgnoreReactionAdds: {
		type: 'guildTextChannel',
		name: 'channels.ignore.reaction-add',
		description: LanguageKeys.Settings.Channels.Ignore.ReactionAdd,
		array: true
	},
	channelsIgnoreVoiceActivities: {
		type: 'guildVoiceChannel',
		name: 'channels.ignore.voice-activity',
		description: LanguageKeys.Settings.Channels.Ignore.VoiceActivity,
		array: true
	},
	commandAutoDelete: {
		type: 'notAllowed',
		name: 'command-auto-delete',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	disabledChannels: {
		type: 'guildTextChannel',
		name: 'disabled-channels',
		description: LanguageKeys.Settings.DisabledChannels,
		array: true
	},
	disabledCommandsChannels: {
		type: 'notAllowed',
		name: 'disabled-commands-channels',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	eventsBanAdd: {
		type: 'boolean',
		name: 'events.ban-add',
		description: LanguageKeys.Settings.EventsBanAdd
	},
	eventsBanRemove: {
		type: 'boolean',
		name: 'events.ban-remove',
		description: LanguageKeys.Settings.EventsBanRemove
	},
	eventsTimeout: {
		type: 'boolean',
		name: 'events.timeout',
		description: LanguageKeys.Settings.EventsTimeout
	},
	eventsUnknownMessages: {
		type: 'boolean',
		name: 'events.unknown-messages',
		description: LanguageKeys.Settings.EventsUnknownMessages
	},
	eventsTwemojiReactions: {
		type: 'boolean',
		name: 'events.twemoji-reactions',
		description: LanguageKeys.Settings.EventsTwemojiReactions
	},
	eventsIncludeBots: {
		type: 'boolean',
		name: 'events.include-bots',
		description: LanguageKeys.Settings.EventsIncludeBots
	},
	messagesIgnoreChannels: {
		type: 'guildTextChannel',
		name: 'messages.ignore-channels',
		description: LanguageKeys.Settings.MessagesIgnoreChannels,
		array: true
	},
	messagesModerationDm: {
		type: 'boolean',
		name: 'messages.moderation-dm',
		description: LanguageKeys.Settings.MessagesModerationDM
	},
	messagesModerationReasonDisplay: {
		type: 'boolean',
		name: 'messages.moderation-reason-display',
		description: LanguageKeys.Settings.MessagesModerationReasonDisplay,
		default: true
	},
	messagesModerationMessageDisplay: {
		type: 'boolean',
		name: 'messages.moderation-message-display',
		description: LanguageKeys.Settings.MessagesModerationMessageDisplay,
		default: true
	},
	messagesModerationAutoDelete: {
		type: 'boolean',
		name: 'messages.moderation-auto-delete',
		description: LanguageKeys.Settings.MessagesModerationAutoDelete,
		default: false
	},
	messagesModeratorNameDisplay: {
		type: 'boolean',
		name: 'messages.moderator-name-display',
		description: LanguageKeys.Settings.MessagesModeratorNameDisplay,
		default: true
	},
	messagesAutoDeleteIgnoredAll: {
		type: 'boolean',
		name: 'messages.auto-delete.ignored-all',
		description: LanguageKeys.Settings.MessagesAutoDeleteIgnoredAll,
		default: false
	},
	messagesAutoDeleteIgnoredRoles: {
		type: 'role',
		name: 'messages.auto-delete.ignored-roles',
		description: LanguageKeys.Settings.MessagesAutoDeleteIgnoredRoles,
		array: true
	},
	messagesAutoDeleteIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'messages.auto-delete.ignored-channels',
		description: LanguageKeys.Settings.MessagesAutoDeleteIgnoredChannels,
		array: true
	},
	messagesAutoDeleteIgnoredCommands: {
		type: 'commandMatch',
		name: 'messages.auto-delete.ignored-commands',
		description: LanguageKeys.Settings.MessagesAutoDeleteIgnoredCommands,
		array: true
	},
	stickyRoles: {
		type: 'notAllowed',
		name: 'sticky-roles',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	reactionRoles: {
		type: 'notAllowed',
		name: 'reaction-roles',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	rolesAdmin: {
		type: 'role',
		name: 'roles.admin',
		description: LanguageKeys.Settings.RolesAdmin,
		array: true
	},
	rolesInitial: {
		type: 'role',
		name: 'roles.initial',
		description: LanguageKeys.Settings.RolesInitial
	},
	rolesInitialHumans: {
		type: 'role',
		name: 'roles.initial-humans',
		description: LanguageKeys.Settings.RolesInitialHumans
	},
	rolesInitialBots: {
		type: 'role',
		name: 'roles.initial-bots',
		description: LanguageKeys.Settings.RolesInitialBots
	},
	rolesModerator: {
		type: 'role',
		name: 'roles.moderator',
		description: LanguageKeys.Settings.RolesModerator,
		array: true
	},
	rolesMuted: {
		type: 'role',
		name: 'roles.muted',
		description: LanguageKeys.Settings.RolesMuted
	},
	rolesRestrictedAttachment: {
		type: 'role',
		name: 'roles.restricted-attachment',
		description: LanguageKeys.Settings.RolesRestrictedAttachment
	},
	rolesRestrictedReaction: {
		type: 'role',
		name: 'roles.restricted-reaction',
		description: LanguageKeys.Settings.RolesRestrictedReaction
	},
	rolesRestrictedEmbed: {
		type: 'role',
		name: 'roles.restricted-embed',
		description: LanguageKeys.Settings.RolesRestrictedEmbed
	},
	rolesRestrictedEmoji: {
		type: 'role',
		name: 'roles.restricted-emoji',
		description: LanguageKeys.Settings.RolesRestrictedEmoji
	},
	rolesRestrictedVoice: {
		type: 'role',
		name: 'roles.restricted-voice',
		description: LanguageKeys.Settings.RolesRestrictedVoice
	},
	rolesPublic: {
		type: 'role',
		name: 'roles.public',
		description: LanguageKeys.Settings.RolesPublic,
		array: true
	},
	rolesRemoveInitial: {
		type: 'boolean',
		name: 'roles.remove-initial',
		description: LanguageKeys.Settings.RolesRemoveInitial,
		default: false
	},
	rolesUniqueRoleSets: {
		type: 'notAllowed',
		name: 'roles.unique-role-sets',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	selfmodAttachmentsEnabled: {
		type: 'boolean',
		name: 'selfmod.attachments.enabled',
		description: LanguageKeys.Settings.SelfmodAttachmentsEnabled,
		default: false
	},
	selfmodAttachmentsIgnoredRoles: {
		type: 'role',
		name: 'selfmod.attachments.ignored-roles',
		description: LanguageKeys.Settings.SelfmodAttachmentsIgnoredRoles,
		array: true
	},
	selfmodAttachmentsIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.attachments.ignored-channels',
		description: LanguageKeys.Settings.SelfmodAttachmentsIgnoredChannels,
		array: true
	},
	selfmodAttachmentsSoftAction: {
		type: 'integer',
		name: 'selfmod.attachments.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodAttachmentsHardAction: {
		type: 'integer',
		name: 'selfmod.attachments.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodAttachmentsHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.attachments.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodAttachmentsThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.attachments.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodAttachmentsThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.attachments.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodCapitalsEnabled: {
		type: 'boolean',
		name: 'selfmod.capitals.enabled',
		description: LanguageKeys.Settings.SelfmodCapitalsEnabled,
		default: false
	},
	selfmodCapitalsIgnoredRoles: {
		type: 'role',
		name: 'selfmod.capitals.ignored-roles',
		description: LanguageKeys.Settings.SelfmodCapitalsIgnoredRoles,
		array: true
	},
	selfmodCapitalsIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.capitals.ignored-channels',
		description: LanguageKeys.Settings.SelfmodCapitalsIgnoredChannels,
		array: true
	},
	selfmodCapitalsMinimum: {
		type: 'integer',
		name: 'selfmod.capitals.minimum',
		description: LanguageKeys.Settings.SelfmodCapitalsMinimum,
		minimum: 5,
		maximum: 2000,
		default: 15
	},
	selfmodCapitalsMaximum: {
		type: 'integer',
		name: 'selfmod.capitals.maximum',
		description: LanguageKeys.Settings.SelfmodCapitalsMaximum,
		minimum: 10,
		maximum: 100,
		default: 50
	},
	selfmodCapitalsSoftAction: {
		type: 'integer',
		name: 'selfmod.capitals.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodCapitalsHardAction: {
		type: 'integer',
		name: 'selfmod.capitals.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodCapitalsHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.capitals.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodCapitalsThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.capitals.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodCapitalsThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.capitals.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodLinksEnabled: {
		type: 'boolean',
		name: 'selfmod.links.enabled',
		description: LanguageKeys.Settings.SelfmodLinksEnabled,
		default: false
	},
	selfmodLinksAllowed: {
		type: 'string',
		name: 'selfmod.links.allowed',
		description: LanguageKeys.Settings.SelfmodLinksAllowed,
		array: true
	},
	selfmodLinksIgnoredRoles: {
		type: 'role',
		name: 'selfmod.links.ignored-roles',
		description: LanguageKeys.Settings.SelfmodLinksIgnoredRoles,
		array: true
	},
	selfmodLinksIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.links.ignored-channels',
		description: LanguageKeys.Settings.SelfmodLinksIgnoredChannels,
		array: true
	},
	selfmodLinksSoftAction: {
		type: 'integer',
		name: 'selfmod.links.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodLinksHardAction: {
		type: 'integer',
		name: 'selfmod.links.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodLinksHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.links.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodLinksThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.links.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodLinksThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.links.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodMessagesEnabled: {
		type: 'boolean',
		name: 'selfmod.messages.enabled',
		description: LanguageKeys.Settings.SelfmodMessagesEnabled,
		default: false
	},
	selfmodMessagesIgnoredRoles: {
		type: 'role',
		name: 'selfmod.messages.ignored-roles',
		description: LanguageKeys.Settings.SelfmodMessagesIgnoredRoles,
		array: true
	},
	selfmodMessagesIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.messages.ignored-channels',
		description: LanguageKeys.Settings.SelfmodMessagesIgnoredChannels,
		array: true
	},
	selfmodMessagesMaximum: {
		type: 'integer',
		name: 'selfmod.messages.maximum',
		description: LanguageKeys.Settings.SelfmodMessagesMaximum,
		minimum: 2,
		maximum: 100,
		default: 5
	},
	selfmodMessagesQueueSize: {
		type: 'integer',
		name: 'selfmod.messages.queue-size',
		description: LanguageKeys.Settings.SelfmodMessagesQueueSize,
		minimum: 10,
		maximum: 100,
		default: 50
	},
	selfmodMessagesSoftAction: {
		type: 'integer',
		name: 'selfmod.messages.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodMessagesHardAction: {
		type: 'integer',
		name: 'selfmod.messages.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodMessagesHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.messages.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodMessagesThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.messages.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodMessagesThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.messages.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodNewlinesEnabled: {
		type: 'boolean',
		name: 'selfmod.newlines.enabled',
		description: LanguageKeys.Settings.SelfmodNewlinesEnabled,
		default: false
	},
	selfmodNewlinesIgnoredRoles: {
		type: 'role',
		name: 'selfmod.newlines.ignored-roles',
		description: LanguageKeys.Settings.SelfmodNewlinesIgnoredRoles,
		array: true
	},
	selfmodNewlinesIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.newlines.ignored-channels',
		description: LanguageKeys.Settings.SelfmodNewlinesIgnoredChannels,
		array: true
	},
	selfmodNewlinesMaximum: {
		type: 'integer',
		name: 'selfmod.newlines.maximum',
		description: LanguageKeys.Settings.SelfmodNewlinesMaximum,
		minimum: 10,
		maximum: 100,
		default: 20
	},
	selfmodNewlinesSoftAction: {
		type: 'integer',
		name: 'selfmod.newlines.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodNewlinesHardAction: {
		type: 'integer',
		name: 'selfmod.newlines.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodNewlinesHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.newlines.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodNewlinesThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.newlines.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodNewlinesThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.newlines.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodInvitesEnabled: {
		type: 'boolean',
		name: 'selfmod.invites.enabled',
		description: LanguageKeys.Settings.SelfmodInvitesEnabled,
		default: false
	},
	selfmodInvitesIgnoredCodes: {
		type: 'string',
		name: 'selfmod.invites.ignored-codes',
		description: LanguageKeys.Settings.SelfmodInvitesIgnoredCodes,
		array: true
	},
	selfmodInvitesIgnoredGuilds: {
		type: 'string',
		name: 'selfmod.invites.ignored-guilds',
		description: LanguageKeys.Settings.SelfmodInvitesIgnoredGuilds,
		array: true
	},
	selfmodInvitesIgnoredRoles: {
		type: 'role',
		name: 'selfmod.invites.ignored-roles',
		description: LanguageKeys.Settings.SelfmodInvitesIgnoredRoles,
		array: true
	},
	selfmodInvitesIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.invites.ignored-channels',
		description: LanguageKeys.Settings.SelfmodInvitesIgnoredChannels,
		array: true
	},
	selfmodInvitesSoftAction: {
		type: 'integer',
		name: 'selfmod.invites.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodInvitesHardAction: {
		type: 'integer',
		name: 'selfmod.invites.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodInvitesHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.invites.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodInvitesThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.invites.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodInvitesThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.invites.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodFilterEnabled: {
		type: 'boolean',
		name: 'selfmod.filter.enabled',
		description: LanguageKeys.Settings.SelfmodFilterEnabled,
		default: false
	},
	selfmodFilterRaw: {
		type: 'string',
		name: 'selfmod.filter.raw',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		array: true,
		dashboardOnly: true
	},
	selfmodFilterIgnoredRoles: {
		type: 'role',
		name: 'selfmod.filter.ignored-roles',
		description: LanguageKeys.Settings.SelfmodFilterIgnoredRoles,
		array: true
	},
	selfmodFilterIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.filter.ignored-channels',
		description: LanguageKeys.Settings.SelfmodFilterIgnoredChannels,
		array: true
	},
	selfmodFilterSoftAction: {
		type: 'integer',
		name: 'selfmod.filter.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodFilterHardAction: {
		type: 'integer',
		name: 'selfmod.filter.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodFilterHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.filter.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodFilterThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.filter.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodFilterThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.filter.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodReactionsEnabled: {
		type: 'boolean',
		name: 'selfmod.reactions.enabled',
		description: LanguageKeys.Settings.SelfmodReactionsEnabled,
		default: false
	},
	selfmodReactionsIgnoredRoles: {
		type: 'role',
		name: 'selfmod.reactions.ignored-roles',
		description: LanguageKeys.Settings.SelfmodReactionsIgnoredRoles,
		array: true
	},
	selfmodReactionsIgnoredChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.reactions.ignored-channels',
		description: LanguageKeys.Settings.SelfmodReactionsIgnoredChannels,
		array: true
	},
	selfmodReactionsMaximum: {
		type: 'integer',
		name: 'selfmod.reactions.maximum',
		description: LanguageKeys.Settings.SelfmodReactionsMaximum,
		minimum: 1,
		maximum: 100,
		default: 10
	},
	selfmodReactionsAllowed: {
		type: 'emoji',
		name: 'selfmod.reactions.allowed',
		description: LanguageKeys.Settings.SelfmodReactionsAllowed,
		array: true
	},
	selfmodReactionsBlocked: {
		type: 'emoji',
		name: 'selfmod.reactions.blocked',
		description: LanguageKeys.Settings.SelfmodReactionsBlocked,
		array: true
	},
	selfmodReactionsSoftAction: {
		type: 'integer',
		name: 'selfmod.reactions.soft-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodReactionsHardAction: {
		type: 'integer',
		name: 'selfmod.reactions.hard-action',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		default: 0,
		dashboardOnly: true
	},
	selfmodReactionsHardActionDuration: {
		type: 'timespan',
		name: 'selfmod.reactions.hard-action-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		dashboardOnly: true
	},
	selfmodReactionsThresholdMaximum: {
		type: 'integer',
		name: 'selfmod.reactions.threshold-maximum',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: 100,
		default: 10,
		dashboardOnly: true
	},
	selfmodReactionsThresholdDuration: {
		type: 'timespan',
		name: 'selfmod.reactions.threshold-duration',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: years(5),
		default: 60000,
		dashboardOnly: true
	},
	selfmodIgnoreChannels: {
		type: 'guildTextChannel',
		name: 'selfmod.ignored-channels',
		description: LanguageKeys.Settings.SelfmodIgnoreChannels,
		array: true
	},
	noMentionSpamEnabled: {
		type: 'boolean',
		name: 'no-mention-spam.enabled',
		description: LanguageKeys.Settings.NoMentionSpamEnabled,
		default: false
	},
	noMentionSpamAlerts: {
		type: 'boolean',
		name: 'no-mention-spam.alerts',
		description: LanguageKeys.Settings.NoMentionSpamAlerts,
		default: false
	},
	noMentionSpamMentionsAllowed: {
		type: 'integer',
		name: 'no-mention-spam.mentions-allowed',
		description: LanguageKeys.Settings.NoMentionSpamMentionsAllowed,
		minimum: 0,
		default: 20
	},
	noMentionSpamTimePeriod: {
		type: 'integer',
		name: 'no-mention-spam.time-period',
		description: LanguageKeys.Settings.NoMentionSpamTimePeriod,
		minimum: 0,
		default: 8
	}
});

function makeKeys(record: Record<GuildDataKey, ConfigurableKeyOptions>): Record<GuildDataKey, SchemaKey> {
	const entries = objectEntries(record).map(([key, value]) => [key, makeKey(key, value)] as const);
	return Object.fromEntries(entries) as Record<GuildDataKey, SchemaKey>;
}

function makeKey(property: GuildDataKey, options: ConfigurableKeyOptions) {
	const value = new SchemaKey({
		...options,
		name: options.name ?? property,
		property,
		array: options.array ?? false,
		inclusive: options.inclusive ?? true,
		minimum: options.minimum ?? null,
		maximum: options.maximum ?? null,
		default: options.default ?? (options.array ? [] : options.type === 'boolean' ? false : null),
		dashboardOnly: options.dashboardOnly ?? false
	});

	configurableKeys.set(property, value);
	value.parent = configurableGroups.add(value.name.split('.') as NonEmptyArray<string>, value);

	return value;
}

interface ConfigurableKeyOptions
	extends Omit<ConfigurableKeyValueOptions, 'property' | 'name' | 'array' | 'inclusive' | 'minimum' | 'maximum' | 'default' | 'dashboardOnly'>,
		Partial<Pick<ConfigurableKeyValueOptions, 'name' | 'array' | 'inclusive' | 'minimum' | 'maximum' | 'default' | 'dashboardOnly'>> {}
