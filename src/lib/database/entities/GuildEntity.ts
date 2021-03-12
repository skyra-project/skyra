import { ConfigurableKey, configurableKeys } from '#lib/database/settings/ConfigurableKey';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RateLimitManager } from '#lib/structures';
import type { AnyObject } from '#lib/types';
import { PREFIX } from '#root/config';
import { Time } from '#utils/constants';
import { create } from '#utils/Security/RegexCreator';
import { Store } from '@sapphire/framework';
import { arrayStrictEquals } from '@sapphire/utilities';
import { Sentence } from '@skyra/tags';
import type { TFunction } from 'i18next';
import { AfterInsert, AfterLoad, AfterRemove, AfterUpdate, BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { AdderManager } from '../settings/structures/AdderManager';
import { PermissionNodeManager } from '../settings/structures/PermissionNodeManager';
import { kBigIntTransformer, kTagsTransformer } from '../utils/Transformers';

@Entity('guilds', { schema: 'public' })
export class GuildEntity extends BaseEntity {
	@PrimaryColumn('varchar', { name: 'id', length: 19 })
	public id!: string;

	@ConfigurableKey({ description: LanguageKeys.Settings.Prefix, minimum: 1, maximum: 10 })
	@Column('varchar', { name: 'prefix', length: 10, default: PREFIX })
	public prefix = PREFIX;

	@ConfigurableKey({ description: LanguageKeys.Settings.Language, type: 'language' })
	@Column('varchar', { name: 'language', default: 'en-US' })
	public language = 'en-US';

	@ConfigurableKey({ description: LanguageKeys.Settings.DisableNaturalPrefix })
	@Column('boolean', { name: 'disableNaturalPrefix', default: false })
	public disableNaturalPrefix = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.DisabledCommands, type: 'commandmatch' })
	@Column('varchar', { name: 'disabledCommands', length: 32, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public disabledCommands: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, type: 'customcommand', array: true })
	@Column('jsonb', { name: 'custom-commands', transformer: kTagsTransformer, default: () => "'[]'::JSONB" })
	public customCommands: CustomCommand[] = [];

	@Column('jsonb', { name: 'permissions.users', default: () => "'[]'::JSONB" })
	public permissionsUsers: PermissionsNode[] = [];

	@Column('jsonb', { name: 'permissions.roles', default: () => "'[]'::JSONB" })
	public permissionsRoles: PermissionsNode[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.BirthdayChannel, type: 'textchannel' })
	@Column('varchar', { name: 'birthday.channel', nullable: true, length: 19 })
	public birthdayChannel?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.BirthdayMessage })
	@Column('varchar', { name: 'birthday.message', nullable: true, length: 200 })
	public birthdayMessage?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.BirthdayRole, type: 'role' })
	@Column('varchar', { name: 'birthday.role', nullable: true, length: 19 })
	public birthdayRole?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsAnnouncements, type: 'textchannel' })
	@Column('varchar', { name: 'channels.announcements', nullable: true, length: 19 })
	public channelsAnnouncements?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsGreeting, type: 'textchannel' })
	@Column('varchar', { name: 'channels.greeting', nullable: true, length: 19 })
	public channelsGreeting?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsFarewell, type: 'textchannel' })
	@Column('varchar', { name: 'channels.farewell', nullable: true, length: 19 })
	public channelsFarewell?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsMemberLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.member-logs', nullable: true, length: 19 })
	public channelsMemberLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsMessageLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.message-logs', nullable: true, length: 19 })
	public channelsMessageLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsModerationLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.moderation-logs', nullable: true, length: 19 })
	public channelsModerationLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsNsfwMessageLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.nsfw-message-logs', nullable: true, length: 19 })
	public channelsNsfwMessageLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsImageLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.image-logs', nullable: true, length: 19 })
	public channelsImageLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsPruneLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.prune-logs', nullable: true, length: 19 })
	public channelsPruneLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsReactionLogs, type: 'textchannel' })
	@Column('varchar', { name: 'channels.reaction-logs', nullable: true, length: 19 })
	public channelsReactionLogs?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsSpam, type: 'textchannel' })
	@Column('varchar', { name: 'channels.spam', nullable: true, length: 19 })
	public channelsSpam?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsIgnoreAll, type: 'textchannel' })
	@Column('varchar', { name: 'channels.ignore.all', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreAll: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsIgnoreMessageEdit, type: 'textchannel' })
	@Column('varchar', { name: 'channels.ignore.message-edit', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreMessageEdits: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsIgnoreMessageDelete, type: 'textchannel' })
	@Column('varchar', { name: 'channels.ignore.message-delete', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreMessageDeletes: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.ChannelsIgnoreReactionAdd, type: 'textchannel' })
	@Column('varchar', { name: 'channels.ignore.reaction-add', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreReactionAdds: string[] = [];

	@Column('jsonb', { name: 'command-autodelete', default: () => "'[]'::JSONB" })
	public commandAutoDelete: CommandAutoDelete[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.DisabledChannels, type: 'textchannel' })
	@Column('varchar', { name: 'disabledChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public disabledChannels: string[] = [];

	@Column('jsonb', { name: 'disabledCommandsChannels', default: () => "'[]'::JSONB" })
	public disabledCommandsChannels: DisabledCommandChannel[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsBanAdd })
	@Column('boolean', { name: 'events.banAdd', default: false })
	public eventsBanAdd = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsBanRemove })
	@Column('boolean', { name: 'events.banRemove', default: false })
	public eventsBanRemove = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMemberAdd })
	@Column('boolean', { name: 'events.memberAdd', default: false })
	public eventsMemberAdd = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMemberRemove })
	@Column('boolean', { name: 'events.memberRemove', default: false })
	public eventsMemberRemove = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMemberNickNameUpdate })
	@Column('boolean', { name: 'events.member-nickname-update', default: false })
	public eventsMemberNickNameUpdate = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMemberUserNameUpdate })
	@Column('boolean', { name: 'events.member-username-update', default: false })
	public eventsMemberUserNameUpdate = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMemberRoleUpdate })
	@Column('boolean', { name: 'events.memberRoleUpdate', default: false })
	public eventsMemberRoleUpdate = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMessageDelete })
	@Column('boolean', { name: 'events.messageDelete', default: false })
	public eventsMessageDelete = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsMessageEdit })
	@Column('boolean', { name: 'events.messageEdit', default: false })
	public eventsMessageEdit = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.EventsTwemojiReactions })
	@Column('boolean', { name: 'events.twemoji-reactions', default: false })
	public eventsTwemojiReactions = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesFarewell })
	@Column('varchar', { name: 'messages.farewell', nullable: true, length: 2000 })
	public messagesFarewell?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesGreeting })
	@Column('varchar', { name: 'messages.greeting', nullable: true, length: 2000 })
	public messagesGreeting?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesJoinDM })
	@Column('varchar', { name: 'messages.join-dm', nullable: true, length: 1500 })
	public messagesJoinDM?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesIgnoreChannels, type: 'textchannel' })
	@Column('varchar', { name: 'messages.ignoreChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public messagesIgnoreChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesAnnouncementEmbed })
	@Column('boolean', { name: 'messages.announcement-embed', default: false })
	public messagesAnnouncementEmbed = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesModerationDM })
	@Column('boolean', { name: 'messages.moderation-dm', default: false })
	public messagesModerationDm = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesModerationReasonDisplay })
	@Column('boolean', { name: 'messages.moderation-reason-display', default: true })
	public messagesModerationReasonDisplay = true;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesModerationMessageDisplay })
	@Column('boolean', { name: 'messages.moderation-message-display', default: true })
	public messagesModerationMessageDisplay = true;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesModerationAutoDelete })
	@Column('boolean', { name: 'messages.moderation-auto-delete', default: false })
	public messagesModerationAutoDelete = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.MessagesModeratorNameDisplay })
	@Column('boolean', { name: 'messages.moderator-name-display', default: true })
	public messagesModeratorNameDisplay = true;

	@Column('jsonb', { name: 'stickyRoles', default: () => "'[]'::JSONB" })
	public stickyRoles: StickyRole[] = [];

	@Column('jsonb', { name: 'reaction-roles', default: () => "'[]'::JSONB" })
	public reactionRoles: ReactionRole[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesAdmin, type: 'role' })
	@Column('varchar', { name: 'roles.admin', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesAdmin: string[] = [];

	@Column('jsonb', { name: 'roles.auto', default: () => "'[]'::JSONB" })
	public rolesAuto: RolesAuto[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesInitial, type: 'role' })
	@Column('varchar', { name: 'roles.initial', nullable: true, length: 19 })
	public rolesInitial?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesModerator, type: 'role' })
	@Column('varchar', { name: 'roles.moderator', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesModerator: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesMuted, type: 'role' })
	@Column('varchar', { name: 'roles.muted', nullable: true, length: 19 })
	public rolesMuted?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRestrictedReaction, type: 'role' })
	@Column('varchar', { name: 'roles.restricted-reaction', nullable: true, length: 19 })
	public rolesRestrictedReaction?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRestrictedEmbed, type: 'role' })
	@Column('varchar', { name: 'roles.restricted-embed', nullable: true, length: 19 })
	public rolesRestrictedEmbed?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRestrictedEmoji, type: 'role' })
	@Column('varchar', { name: 'roles.restricted-emoji', nullable: true, length: 19 })
	public rolesRestrictedEmoji?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRestrictedAttachment, type: 'role' })
	@Column('varchar', { name: 'roles.restricted-attachment', nullable: true, length: 19 })
	public rolesRestrictedAttachment?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRestrictedVoice, type: 'role' })
	@Column('varchar', { name: 'roles.restricted-voice', nullable: true, length: 19 })
	public rolesRestrictedVoice?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesPublic, type: 'role' })
	@Column('varchar', { name: 'roles.public', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesPublic: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesRemoveInitial })
	@Column('boolean', { name: 'roles.removeInitial', default: false })
	public rolesRemoveInitial = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesDj, type: 'role' })
	@Column('varchar', { name: 'roles.dj', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesDj: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.RolesSubscriber, type: 'role' })
	@Column('varchar', { name: 'roles.subscriber', nullable: true, length: 19 })
	public rolesSubscriber?: string | null;

	@Column('jsonb', { name: 'roles.uniqueRoleSets', default: () => "'[]'::JSONB" })
	public rolesUniqueRoleSets: UniqueRoleSet[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodAttachmentsEnabled })
	@Column('boolean', { name: 'selfmod.attachments.enabled', default: false })
	public selfmodAttachmentsEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodAttachmentsIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.attachments.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodAttachmentsIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodAttachmentsIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.attachments.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodAttachmentsIgnoredChannels: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.attachments.softAction', default: 0 })
	public selfmodAttachmentsSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.attachments.hardAction', default: 0 })
	public selfmodAttachmentsHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.attachments.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodAttachmentsHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.attachments.thresholdMaximum', default: 10 })
	public selfmodAttachmentsThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.attachments.thresholdDuration', default: 60000 })
	public selfmodAttachmentsThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodCapitalsEnabled })
	@Column('boolean', { name: 'selfmod.capitals.enabled', default: false })
	public selfmodCapitalsEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodCapitalsIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.capitals.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodCapitalsIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodCapitalsIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.capitals.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodCapitalsIgnoredChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodCapitalsMinimum, minimum: 5, maximum: 2000 })
	@Column('smallint', { name: 'selfmod.capitals.minimum', default: 15 })
	public selfmodCapitalsMinimum = 15;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodCapitalsMaximum, minimum: 10, maximum: 100 })
	@Column('smallint', { name: 'selfmod.capitals.maximum', default: 50 })
	public selfmodCapitalsMaximum = 50;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.capitals.softAction', default: 0 })
	public selfmodCapitalsSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.capitals.hardAction', default: 0 })
	public selfmodCapitalsHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.capitals.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodCapitalsHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.capitals.thresholdMaximum', default: 10 })
	public selfmodCapitalsThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.capitals.thresholdDuration', default: 60000 })
	public selfmodCapitalsThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodLinksEnabled })
	@Column('boolean', { name: 'selfmod.links.enabled', default: false })
	public selfmodLinksEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodLinksWhiteList })
	@Column('varchar', { name: 'selfmod.links.whitelist', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksWhitelist: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodLinksIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.links.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodLinksIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.links.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksIgnoredChannels: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.links.softAction', default: 0 })
	public selfmodLinksSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.links.hardAction', default: 0 })
	public selfmodLinksHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.links.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodLinksHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.links.thresholdMaximum', default: 10 })
	public selfmodLinksThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.links.thresholdDuration', default: 60000 })
	public selfmodLinksThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodMessagesEnabled })
	@Column('boolean', { name: 'selfmod.messages.enabled', default: false })
	public selfmodMessagesEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodMessagesIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.messages.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodMessagesIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodMessagesIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.messages.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodMessagesIgnoredChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodMessagesMaximum, minimum: 2, maximum: 100 })
	@Column('smallint', { name: 'selfmod.messages.maximum', default: 5 })
	public selfmodMessagesMaximum = 5;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodMessagesQueueSize, minimum: 10, maximum: 100 })
	@Column('smallint', { name: 'selfmod.messages.queue-size', default: 50 })
	public selfmodMessagesQueueSize = 50;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.messages.softAction', default: 0 })
	public selfmodMessagesSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.messages.hardAction', default: 0 })
	public selfmodMessagesHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.messages.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodMessagesHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.messages.thresholdMaximum', default: 10 })
	public selfmodMessagesThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.messages.thresholdDuration', default: 60000 })
	public selfmodMessagesThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodNewlinesEnabled })
	@Column('boolean', { name: 'selfmod.newlines.enabled', default: false })
	public selfmodNewlinesEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodNewlinesIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.newlines.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodNewlinesIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodNewlinesIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.newlines.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodNewlinesIgnoredChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodNewlinesMaximum, minimum: 10, maximum: 100 })
	@Column('smallint', { name: 'selfmod.newlines.maximum', default: 20 })
	public selfmodNewlinesMaximum = 20;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.newlines.softAction', default: 0 })
	public selfmodNewlinesSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.newlines.hardAction', default: 0 })
	public selfmodNewlinesHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.newlines.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodNewlinesHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.newlines.thresholdMaximum', default: 10 })
	public selfmodNewlinesThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.newlines.thresholdDuration', default: 60000 })
	public selfmodNewlinesThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodInvitesEnabled })
	@Column('boolean', { name: 'selfmod.invites.enabled', default: false })
	public selfmodInvitesEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodInvitesIgnoredCodes })
	@Column('varchar', { name: 'selfmod.invites.ignoredCodes', array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredCodes: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodInvitesIgnoredGuilds })
	@Column('varchar', { name: 'selfmod.invites.ignoredGuilds', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredGuilds: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodInvitesIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.invites.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodInvitesIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.invites.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredChannels: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.invites.softAction', default: 0 })
	public selfmodInvitesSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.invites.hardAction', default: 0 })
	public selfmodInvitesHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.invites.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodInvitesHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.invites.thresholdMaximum', default: 10 })
	public selfmodInvitesThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.invites.thresholdDuration', default: 60000 })
	public selfmodInvitesThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodFilterEnabled })
	@Column('boolean', { name: 'selfmod.filter.enabled', default: false })
	public selfmodFilterEnabled = false;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('varchar', { name: 'selfmod.filter.raw', length: 32, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterRaw: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodFilterIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.filter.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodFilterIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.filter.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterIgnoredChannels: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.filter.softAction', default: 0 })
	public selfmodFilterSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.filter.hardAction', default: 0 })
	public selfmodFilterHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.filter.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodFilterHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.filter.thresholdMaximum', default: 10 })
	public selfmodFilterThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.filter.thresholdDuration', default: 60000 })
	public selfmodFilterThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsEnabled })
	@Column('boolean', { name: 'selfmod.reactions.enabled', default: false })
	public selfmodReactionsEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsIgnoredRoles, type: 'role' })
	@Column('varchar', { name: 'selfmod.reactions.ignoredRoles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsIgnoredRoles: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsIgnoredChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.reactions.ignoredChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsIgnoredChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsMaximum, minimum: 1, maximum: 100 })
	@Column('smallint', { name: 'selfmod.reactions.maximum', default: 10 })
	public selfmodReactionsMaximum = 10;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsWhiteList })
	@Column('varchar', { name: 'selfmod.reactions.whitelist', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsWhitelist: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodReactionsBlackList })
	@Column('varchar', { name: 'selfmod.reactions.blacklist', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsBlacklist: string[] = [];

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.reactions.softAction', default: 0 })
	public selfmodReactionsSoftAction = 0;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey })
	@Column('smallint', { name: 'selfmod.reactions.hardAction', default: 0 })
	public selfmodReactionsHardAction = 0;

	@ConfigurableKey({
		dashboardOnly: true,
		type: 'timespan',
		description: LanguageKeys.Settings.DashboardOnlyKey,
		minimum: 0,
		maximum: Time.Year * 5
	})
	@Column('bigint', { name: 'selfmod.reactions.hardActionDuration', nullable: true, transformer: kBigIntTransformer })
	public selfmodReactionsHardActionDuration: number | null = null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: 100 })
	@Column('smallint', { name: 'selfmod.reactions.thresholdMaximum', default: 10 })
	public selfmodReactionsThresholdMaximum = 10;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, minimum: 0, maximum: Time.Minute * 5 })
	@Column('integer', { name: 'selfmod.reactions.thresholdDuration', default: 60000 })
	public selfmodReactionsThresholdDuration = 60000;

	@ConfigurableKey({ description: LanguageKeys.Settings.SelfmodIgnoreChannels, type: 'textchannel' })
	@Column('varchar', { name: 'selfmod.ignoreChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodIgnoreChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.NoMentionSpamEnabled })
	@Column('boolean', { name: 'no-mention-spam.enabled', default: false })
	public noMentionSpamEnabled = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.NoMentionSpamAlerts })
	@Column('boolean', { name: 'no-mention-spam.alerts', default: false })
	public noMentionSpamAlerts = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.NoMentionSpamMentionsAllowed, minimum: 0 })
	@Column('smallint', { name: 'no-mention-spam.mentionsAllowed', default: 20 })
	public noMentionSpamMentionsAllowed = 20;

	@ConfigurableKey({ description: LanguageKeys.Settings.NoMentionSpamTimePeriod, minimum: 0 })
	@Column('integer', { name: 'no-mention-spam.timePeriod', default: 8 })
	public noMentionSpamTimePeriod = 8;

	@ConfigurableKey({ description: LanguageKeys.Settings.SocialEnabled })
	@Column('boolean', { name: 'social.enabled', default: true })
	public socialEnabled = true;

	@ConfigurableKey({ description: LanguageKeys.Settings.SocialAchieve })
	@Column('boolean', { name: 'social.achieve', default: false })
	public socialAchieve = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SocialAchieveMessage })
	@Column('varchar', { name: 'social.achieveMessage', nullable: true, length: 2000 })
	public socialAchieveMessage?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.SocialMultiplier, minimum: 0, maximum: 5 })
	@Column('numeric', { name: 'social.multiplier', precision: 53, default: 1 })
	public socialMultiplier = 1;

	@ConfigurableKey({ description: LanguageKeys.Settings.SocialIgnoreChannels, type: 'textchannel' })
	@Column('varchar', { name: 'social.ignoreChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public socialIgnoreChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.StarboardChannel, type: 'textchannel' })
	@Column('varchar', { name: 'starboard.channel', nullable: true, length: 19 })
	public starboardChannel?: string | null;

	@ConfigurableKey({ dashboardOnly: true, description: LanguageKeys.Settings.DashboardOnlyKey, type: 'emoji' })
	@Column('varchar', { name: 'starboard.emoji', length: 75, default: '%E2%AD%90' })
	public starboardEmoji = '%E2%AD%90';

	@ConfigurableKey({ description: LanguageKeys.Settings.StarboardIgnoreChannels, type: 'textchannel' })
	@Column('varchar', { name: 'starboard.ignoreChannels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public starboardIgnoreChannels: string[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.StarboardMinimum, minimum: 1 })
	@Column('smallint', { name: 'starboard.minimum', default: 1 })
	public starboardMinimum = 1;

	@ConfigurableKey({ description: LanguageKeys.Settings.StarboardSelfStar })
	@Column('boolean', { name: 'starboard.selfStar', default: false })
	public starboardSelfStar = false;

	@Column('jsonb', { name: 'trigger.alias', default: () => "'[]'::JSONB" })
	public triggerAlias: TriggerAlias[] = [];

	@Column('jsonb', { name: 'trigger.includes', default: () => "'[]'::JSONB" })
	public triggerIncludes: TriggerIncludes[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.MusicDefaultVolume, minimum: 0, maximum: 200 })
	@Column('smallint', { name: 'music.default-volume', default: 100 })
	public musicDefaultVolume = 100;

	@ConfigurableKey({ description: LanguageKeys.Settings.MusicMaximumDuration, minimum: 0, maximum: Time.Hour * 12 })
	@Column('integer', { name: 'music.maximum-duration', default: Time.Hour * 2 })
	public musicMaximumDuration = Time.Hour * 2;

	@ConfigurableKey({ description: LanguageKeys.Settings.MusicMaximumEntriesPerUser, minimum: 1, maximum: 250 })
	@Column('smallint', { name: 'music.maximum-entries-per-user', default: 100 })
	public musicMaximumEntriesPerUser = 100;

	@ConfigurableKey({ description: LanguageKeys.Settings.MusicAllowStreams })
	@Column('boolean', { name: 'music.allow-streams', default: true })
	public musicAllowStreams = true;

	@Column('jsonb', { name: 'notifications.streams.twitch.streamers', default: () => "'[]'::JSONB" })
	public notificationsStreamsTwitchStreamers: NotificationsStreamTwitch[] = [];

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsEmojisUpvote, type: 'emoji' })
	@Column('varchar', { name: 'suggestions.emojis.upvote', length: 128, default: ':ArrowT:694594285487652954' })
	public suggestionsEmojisUpvote = ':ArrowT:694594285487652954';

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsEmojisDownvote, type: 'emoji' })
	@Column('varchar', { name: 'suggestions.emojis.downvote', length: 128, default: ':ArrowB:694594285269680179' })
	public suggestionsEmojisDownvote = ':ArrowB:694594285269680179';

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsChannel, type: 'textchannel' })
	@Column('varchar', { name: 'suggestions.channel', nullable: true, length: 19 })
	public suggestionsChannel?: string | null;

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsOnActionDM })
	@Column('boolean', { name: 'suggestions.on-action.dm', default: false })
	public suggestionsOnActionDm = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsOnActionRepost })
	@Column('boolean', { name: 'suggestions.on-action.repost', default: false })
	public suggestionsOnActionRepost = false;

	@ConfigurableKey({ description: LanguageKeys.Settings.SuggestionsOnActionHideAuthor })
	@Column('boolean', { name: 'suggestions.on-action.hide-author', default: false })
	public suggestionsOnActionHideAuthor = false;

	/**
	 * The anti-spam adders used to control spam
	 */
	public readonly adders = new AdderManager(this);
	public readonly permissionNodes = new PermissionNodeManager(this);

	public wordFilterRegExp: RegExp | null = null;

	/**
	 * The ratelimit management for the no-mention-spam behavior
	 */
	public nms: RateLimitManager = null!;

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#words: readonly string[] = [];

	public get client() {
		return Store.injectedContext.client;
	}

	public get guild() {
		return this.client.guilds.cache.get(this.id)!;
	}

	/**
	 * Gets the [[Language]] for this entity.
	 */
	public getLanguage(): TFunction {
		return this.client.i18n.fetchT(this.language);
	}

	/**
	 * Gets the bare representation of the entity.
	 */
	public toJSON(): AnyObject {
		return Object.fromEntries(configurableKeys.map((v) => [v.property, this[v.property] ?? v.default]));
	}

	@AfterLoad()
	protected entityLoad() {
		this.adders.refresh();
		this.permissionNodes.refresh();
		this.nms = new RateLimitManager(this.noMentionSpamTimePeriod * 1000, this.noMentionSpamMentionsAllowed);
		this.wordFilterRegExp = this.selfmodFilterRaw.length ? new RegExp(create(this.selfmodFilterRaw), 'gi') : null;
		this.#words = this.selfmodFilterRaw.slice();
	}

	@AfterInsert()
	@AfterUpdate()
	protected entityUpdate() {
		this.adders.refresh();
		this.permissionNodes.onPatch();

		if (!arrayStrictEquals(this.#words, this.selfmodFilterRaw)) {
			this.#words = this.selfmodFilterRaw.slice();
			this.wordFilterRegExp = this.selfmodFilterRaw.length ? new RegExp(create(this.selfmodFilterRaw), 'gi') : null;
		}
	}

	@AfterRemove()
	protected entityRemove() {
		this.adders.onRemove();
		this.permissionNodes.onRemove();
		this.wordFilterRegExp = null;
		this.#words = [];
	}
}

export interface PermissionsNode {
	id: string;
	allow: string[];
	deny: string[];
}

export interface CustomCommand {
	id: string;
	embed: boolean;
	color: number;
	content: Sentence;
}

export type CommandAutoDelete = readonly [string, number];

export interface DisabledCommandChannel {
	channel: string;
	commands: string[];
}

export interface StickyRole {
	user: string;
	roles: string[];
}

export interface ReactionRole {
	role: string;
	emoji: string;
	message: string | null;
	channel: string;
}

export interface RolesAuto {
	id: string;
	points: number;
}

export interface TriggerAlias {
	input: string;
	output: string;
}

export interface TriggerIncludes extends TriggerAlias {
	action: 'react';
}

export interface UniqueRoleSet {
	name: string;
	roles: readonly string[];
}

export const enum NotificationsStreamsTwitchEventStatus {
	Online,
	Offline
}

export interface NotificationsStreamsTwitchStreamer {
	channel: string;
	author: string;
	message: string | null;
	status: NotificationsStreamsTwitchEventStatus;
	gamesBlacklist: readonly string[];
	gamesWhitelist: readonly string[];
	createdAt: number;
}

export type NotificationsStreamTwitch = [string, readonly NotificationsStreamsTwitchStreamer[]];
