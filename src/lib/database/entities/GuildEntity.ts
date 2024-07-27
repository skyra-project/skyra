import { configurableKeys } from '#lib/database/settings/configuration';
import { AdderManager } from '#lib/database/settings/structures/AdderManager';
import { PermissionNodeManager } from '#lib/database/settings/structures/PermissionNodeManager';
import type { GuildData } from '#lib/database/settings/types';
import { kBigIntTransformer } from '#lib/database/utils/Transformers';
import { create } from '#utils/Security/RegexCreator';
import type { SerializedEmoji } from '#utils/functions';
import { container } from '@sapphire/framework';
import { RateLimitManager } from '@sapphire/ratelimits';
import { arrayStrictEquals, type PickByValue } from '@sapphire/utilities';
import type { LocaleString } from 'discord.js';
import { AfterInsert, AfterLoad, AfterRemove, AfterUpdate, BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('guilds', { schema: 'public' })
export class GuildEntity extends BaseEntity {
	@PrimaryColumn('varchar', { name: 'id', length: 19 })
	public id!: string;

	@Column('varchar', { name: 'prefix', length: 10, default: process.env.CLIENT_PREFIX })
	public prefix = process.env.CLIENT_PREFIX;

	@Column('varchar', { name: 'language', default: 'en-US' })
	public language: LocaleString = 'en-US';

	@Column('boolean', { name: 'disable-natural-prefix', default: false })
	public disableNaturalPrefix = false;

	@Column('varchar', { name: 'disabled-commands', length: 32, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public disabledCommands: string[] = [];

	@Column('jsonb', { name: 'permissions.users', default: () => "'[]'::JSONB" })
	public permissionsUsers: readonly PermissionsNode[] = [];

	@Column('jsonb', { name: 'permissions.roles', default: () => "'[]'::JSONB" })
	public permissionsRoles: readonly PermissionsNode[] = [];

	@Column('varchar', { name: 'channels.media-only', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsMediaOnly: string[] = [];

	@Column('varchar', { name: 'channels.logs.moderation', nullable: true, length: 19 })
	public channelsLogsModeration?: string | null;

	@Column('varchar', { name: 'channels.logs.image', nullable: true, length: 19 })
	public channelsLogsImage?: string | null;

	@Column('varchar', { name: 'channels.logs.member-add', nullable: true, length: 19 })
	public channelsLogsMemberAdd?: string | null;

	@Column('varchar', { name: 'channels.logs.member-remove', nullable: true, length: 19 })
	public channelsLogsMemberRemove?: string | null;

	@Column('varchar', { name: 'channels.logs.member-nickname-update', nullable: true, length: 19 })
	public channelsLogsMemberNickNameUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.member-username-update', nullable: true, length: 19 })
	public channelsLogsMemberUserNameUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.member-roles-update', nullable: true, length: 19 })
	public channelsLogsMemberRolesUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.message-delete', nullable: true, length: 19 })
	public channelsLogsMessageDelete?: string | null;

	@Column('varchar', { name: 'channels.logs.message-delete-nsfw', nullable: true, length: 19 })
	public channelsLogsMessageDeleteNsfw?: string | null;

	@Column('varchar', { name: 'channels.logs.message-update', nullable: true, length: 19 })
	public channelsLogsMessageUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.message-update-nsfw', nullable: true, length: 19 })
	public channelsLogsMessageUpdateNsfw?: string | null;

	@Column('varchar', { name: 'channels.logs.prune', nullable: true, length: 19 })
	public channelsLogsPrune?: string | null;

	@Column('varchar', { name: 'channels.logs.reaction', nullable: true, length: 19 })
	public channelsLogsReaction?: string | null;

	@Column('varchar', { name: 'channels.logs.role-create', nullable: true, length: 19 })
	public channelsLogsRoleCreate?: string | null;

	@Column('varchar', { name: 'channels.logs.role-update', nullable: true, length: 19 })
	public channelsLogsRoleUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.role-delete', nullable: true, length: 19 })
	public channelsLogsRoleDelete?: string | null;

	@Column('varchar', { name: 'channels.logs.channel-create', nullable: true, length: 19 })
	public channelsLogsChannelCreate?: string | null;

	@Column('varchar', { name: 'channels.logs.channel-update', nullable: true, length: 19 })
	public channelsLogsChannelUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.channel-delete', nullable: true, length: 19 })
	public channelsLogsChannelDelete?: string | null;

	@Column('varchar', { name: 'channels.logs.emoji-create', nullable: true, length: 19 })
	public channelsLogsEmojiCreate?: string | null;

	@Column('varchar', { name: 'channels.logs.emoji-update', nullable: true, length: 19 })
	public channelsLogsEmojiUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.emoji-delete', nullable: true, length: 19 })
	public channelsLogsEmojiDelete?: string | null;

	@Column('varchar', { name: 'channels.logs.server-update', nullable: true, length: 19 })
	public channelsLogsServerUpdate?: string | null;

	@Column('varchar', { name: 'channels.logs.voice-activity', nullable: true, length: 19 })
	public channelsLogsVoiceChannel?: string | null;

	@Column('varchar', { name: 'channels.ignore.all', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreAll: string[] = [];

	@Column('varchar', { name: 'channels.ignore.message-edit', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreMessageEdits: string[] = [];

	@Column('varchar', { name: 'channels.ignore.message-delete', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreMessageDeletes: string[] = [];

	@Column('varchar', { name: 'channels.ignore.reaction-add', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreReactionAdds: string[] = [];

	@Column('varchar', { name: 'channels.ignore.voice-activity', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public channelsIgnoreVoiceActivities: string[] = [];

	@Column('jsonb', { name: 'command-auto-delete', default: () => "'[]'::JSONB" })
	public commandAutoDelete: CommandAutoDelete[] = [];

	@Column('varchar', { name: 'disabled-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public disabledChannels: string[] = [];

	@Column('jsonb', { name: 'disabled-commands-channels', default: () => "'[]'::JSONB" })
	public disabledCommandsChannels: DisabledCommandChannel[] = [];

	@Column('boolean', { name: 'events.ban-add', default: false })
	public eventsBanAdd = false;

	@Column('boolean', { name: 'events.ban-remove', default: false })
	public eventsBanRemove = false;

	@Column('boolean', { name: 'events.timeout', default: false })
	public eventsTimeout = false;

	@Column('boolean', { name: 'events.unknown-messages', default: false })
	public eventsUnknownMessages = false;

	@Column('boolean', { name: 'events.twemoji-reactions', default: false })
	public eventsTwemojiReactions = false;

	@Column('boolean', { name: 'events.include-bots', default: false })
	public eventsIncludeBots = false;

	@Column('varchar', { name: 'messages.ignore-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public messagesIgnoreChannels: string[] = [];

	@Column('boolean', { name: 'messages.moderation-dm', default: false })
	public messagesModerationDm = false;

	@Column('boolean', { name: 'messages.moderation-reason-display', default: true })
	public messagesModerationReasonDisplay = true;

	@Column('boolean', { name: 'messages.moderation-message-display', default: true })
	public messagesModerationMessageDisplay = true;

	@Column('boolean', { name: 'messages.moderation-auto-delete', default: false })
	public messagesModerationAutoDelete = false;

	@Column('boolean', { name: 'messages.moderator-name-display', default: true })
	public messagesModeratorNameDisplay = true;

	@Column('boolean', { name: 'messages.auto-delete.ignored-all', default: false })
	public messagesAutoDeleteIgnoredAll = false;

	@Column('varchar', { name: 'messages.auto-delete.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public messagesAutoDeleteIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'messages.auto-delete.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public messagesAutoDeleteIgnoredChannels: string[] = [];

	@Column('varchar', { name: 'messages.auto-delete.ignored-commands', length: 32, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public messagesAutoDeleteIgnoredCommands: string[] = [];

	@Column('jsonb', { name: 'sticky-roles', default: () => "'[]'::JSONB" })
	public stickyRoles: StickyRole[] = [];

	@Column('jsonb', { name: 'reaction-roles', default: () => "'[]'::JSONB" })
	public reactionRoles: ReactionRole[] = [];

	@Column('varchar', { name: 'roles.admin', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesAdmin: string[] = [];

	@Column('varchar', { name: 'roles.initial', nullable: true, length: 19 })
	public rolesInitial?: string | null;

	@Column('varchar', { name: 'roles.initial-humans', nullable: true, length: 19 })
	public rolesInitialHumans?: string | null;

	@Column('varchar', { name: 'roles.initial-bots', nullable: true, length: 19 })
	public rolesInitialBots?: string | null;

	@Column('varchar', { name: 'roles.moderator', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesModerator: string[] = [];

	@Column('varchar', { name: 'roles.muted', nullable: true, length: 19 })
	public rolesMuted?: string | null;

	@Column('varchar', { name: 'roles.restricted-reaction', nullable: true, length: 19 })
	public rolesRestrictedReaction?: string | null;

	@Column('varchar', { name: 'roles.restricted-embed', nullable: true, length: 19 })
	public rolesRestrictedEmbed?: string | null;

	@Column('varchar', { name: 'roles.restricted-emoji', nullable: true, length: 19 })
	public rolesRestrictedEmoji?: string | null;

	@Column('varchar', { name: 'roles.restricted-attachment', nullable: true, length: 19 })
	public rolesRestrictedAttachment?: string | null;

	@Column('varchar', { name: 'roles.restricted-voice', nullable: true, length: 19 })
	public rolesRestrictedVoice?: string | null;

	@Column('varchar', { name: 'roles.public', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public rolesPublic: string[] = [];

	@Column('boolean', { name: 'roles.remove-initial', default: false })
	public rolesRemoveInitial = false;

	@Column('jsonb', { name: 'roles.unique-role-sets', default: () => "'[]'::JSONB" })
	public rolesUniqueRoleSets: UniqueRoleSet[] = [];

	@Column('boolean', { name: 'selfmod.attachments.enabled', default: false })
	public selfmodAttachmentsEnabled = false;

	@Column('varchar', { name: 'selfmod.attachments.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodAttachmentsIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.attachments.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodAttachmentsIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.attachments.soft-action', default: 0 })
	public selfmodAttachmentsSoftAction = 0;

	@Column('smallint', { name: 'selfmod.attachments.hard-action', default: 0 })
	public selfmodAttachmentsHardAction = 0;

	@Column('bigint', { name: 'selfmod.attachments.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodAttachmentsHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.attachments.threshold-maximum', default: 10 })
	public selfmodAttachmentsThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.attachments.threshold-duration', default: 60000 })
	public selfmodAttachmentsThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.capitals.enabled', default: false })
	public selfmodCapitalsEnabled = false;

	@Column('varchar', { name: 'selfmod.capitals.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodCapitalsIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.capitals.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodCapitalsIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.capitals.minimum', default: 15 })
	public selfmodCapitalsMinimum = 15;

	@Column('smallint', { name: 'selfmod.capitals.maximum', default: 50 })
	public selfmodCapitalsMaximum = 50;

	@Column('smallint', { name: 'selfmod.capitals.soft-action', default: 0 })
	public selfmodCapitalsSoftAction = 0;

	@Column('smallint', { name: 'selfmod.capitals.hard-action', default: 0 })
	public selfmodCapitalsHardAction = 0;

	@Column('bigint', { name: 'selfmod.capitals.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodCapitalsHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.capitals.threshold-maximum', default: 10 })
	public selfmodCapitalsThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.capitals.threshold-duration', default: 60000 })
	public selfmodCapitalsThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.links.enabled', default: false })
	public selfmodLinksEnabled = false;

	@Column('varchar', { name: 'selfmod.links.allowed', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksAllowed: string[] = [];

	@Column('varchar', { name: 'selfmod.links.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.links.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodLinksIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.links.soft-action', default: 0 })
	public selfmodLinksSoftAction = 0;

	@Column('smallint', { name: 'selfmod.links.hard-action', default: 0 })
	public selfmodLinksHardAction = 0;

	@Column('bigint', { name: 'selfmod.links.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodLinksHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.links.threshold-maximum', default: 10 })
	public selfmodLinksThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.links.threshold-duration', default: 60000 })
	public selfmodLinksThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.messages.enabled', default: false })
	public selfmodMessagesEnabled = false;

	@Column('varchar', { name: 'selfmod.messages.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodMessagesIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.messages.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodMessagesIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.messages.maximum', default: 5 })
	public selfmodMessagesMaximum = 5;

	@Column('smallint', { name: 'selfmod.messages.queue-size', default: 50 })
	public selfmodMessagesQueueSize = 50;

	@Column('smallint', { name: 'selfmod.messages.soft-action', default: 0 })
	public selfmodMessagesSoftAction = 0;

	@Column('smallint', { name: 'selfmod.messages.hard-action', default: 0 })
	public selfmodMessagesHardAction = 0;

	@Column('bigint', { name: 'selfmod.messages.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodMessagesHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.messages.threshold-maximum', default: 10 })
	public selfmodMessagesThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.messages.threshold-duration', default: 60000 })
	public selfmodMessagesThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.newlines.enabled', default: false })
	public selfmodNewlinesEnabled = false;

	@Column('varchar', { name: 'selfmod.newlines.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodNewlinesIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.newlines.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodNewlinesIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.newlines.maximum', default: 20 })
	public selfmodNewlinesMaximum = 20;

	@Column('smallint', { name: 'selfmod.newlines.soft-action', default: 0 })
	public selfmodNewlinesSoftAction = 0;

	@Column('smallint', { name: 'selfmod.newlines.hard-action', default: 0 })
	public selfmodNewlinesHardAction = 0;

	@Column('bigint', { name: 'selfmod.newlines.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodNewlinesHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.newlines.threshold-maximum', default: 10 })
	public selfmodNewlinesThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.newlines.threshold-duration', default: 60000 })
	public selfmodNewlinesThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.invites.enabled', default: false })
	public selfmodInvitesEnabled = false;

	@Column('varchar', { name: 'selfmod.invites.ignored-codes', array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredCodes: string[] = [];

	@Column('varchar', { name: 'selfmod.invites.ignored-guilds', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredGuilds: string[] = [];

	@Column('varchar', { name: 'selfmod.invites.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.invites.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodInvitesIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.invites.soft-action', default: 0 })
	public selfmodInvitesSoftAction = 0;

	@Column('smallint', { name: 'selfmod.invites.hard-action', default: 0 })
	public selfmodInvitesHardAction = 0;

	@Column('bigint', { name: 'selfmod.invites.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodInvitesHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.invites.threshold-maximum', default: 10 })
	public selfmodInvitesThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.invites.threshold-duration', default: 60000 })
	public selfmodInvitesThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.filter.enabled', default: false })
	public selfmodFilterEnabled = false;

	@Column('varchar', { name: 'selfmod.filter.raw', length: 32, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterRaw: string[] = [];

	@Column('varchar', { name: 'selfmod.filter.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.filter.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodFilterIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.filter.soft-action', default: 0 })
	public selfmodFilterSoftAction = 0;

	@Column('smallint', { name: 'selfmod.filter.hard-action', default: 0 })
	public selfmodFilterHardAction = 0;

	@Column('bigint', { name: 'selfmod.filter.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodFilterHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.filter.threshold-maximum', default: 10 })
	public selfmodFilterThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.filter.threshold-duration', default: 60000 })
	public selfmodFilterThresholdDuration = 60000;

	@Column('boolean', { name: 'selfmod.reactions.enabled', default: false })
	public selfmodReactionsEnabled = false;

	@Column('varchar', { name: 'selfmod.reactions.ignored-roles', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsIgnoredRoles: string[] = [];

	@Column('varchar', { name: 'selfmod.reactions.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsIgnoredChannels: string[] = [];

	@Column('smallint', { name: 'selfmod.reactions.maximum', default: 10 })
	public selfmodReactionsMaximum = 10;

	@Column('varchar', { name: 'selfmod.reactions.allowed', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsAllowed: SerializedEmoji[] = [];

	@Column('varchar', { name: 'selfmod.reactions.blocked', length: 128, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodReactionsBlocked: SerializedEmoji[] = [];

	@Column('smallint', { name: 'selfmod.reactions.soft-action', default: 0 })
	public selfmodReactionsSoftAction = 0;

	@Column('smallint', { name: 'selfmod.reactions.hard-action', default: 0 })
	public selfmodReactionsHardAction = 0;

	@Column('bigint', { name: 'selfmod.reactions.hard-action-duration', nullable: true, transformer: kBigIntTransformer })
	public selfmodReactionsHardActionDuration: number | null = null;

	@Column('smallint', { name: 'selfmod.reactions.threshold-maximum', default: 10 })
	public selfmodReactionsThresholdMaximum = 10;

	@Column('integer', { name: 'selfmod.reactions.threshold-duration', default: 60000 })
	public selfmodReactionsThresholdDuration = 60000;

	@Column('varchar', { name: 'selfmod.ignored-channels', length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public selfmodIgnoreChannels: string[] = [];

	@Column('boolean', { name: 'no-mention-spam.enabled', default: false })
	public noMentionSpamEnabled = false;

	@Column('boolean', { name: 'no-mention-spam.alerts', default: false })
	public noMentionSpamAlerts = false;

	@Column('smallint', { name: 'no-mention-spam.mentions-allowed', default: 20 })
	public noMentionSpamMentionsAllowed = 20;

	@Column('integer', { name: 'no-mention-spam.time-period', default: 8 })
	public noMentionSpamTimePeriod = 8;

	/**
	 * The anti-spam adders used to control spam
	 */
	public readonly adders: AdderManager = new AdderManager(this);
	public readonly permissionNodes = new PermissionNodeManager(this);

	public wordFilterRegExp: RegExp | null = null;

	/**
	 * The ratelimit management for the no-mention-spam behavior
	 */
	public nms: RateLimitManager = null!;

	#words: readonly string[] = [];

	public get guild() {
		return container.client.guilds.cache.get(this.id)!;
	}

	/**
	 * Gets the bare representation of the entity.
	 */
	public toJSON(): GuildData {
		return Object.fromEntries(configurableKeys.map((v) => [v.property, this[v.property] ?? v.default])) as GuildData;
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

export type GuildSettingsOfType<T> = PickByValue<GuildData, T>;

export interface PermissionsNode {
	readonly allow: string[];
	readonly deny: string[];
	readonly id: string;
}

export type CommandAutoDelete = readonly [string, number];

export interface DisabledCommandChannel {
	readonly channel: string;
	readonly commands: readonly string[];
}

export interface StickyRole {
	readonly roles: readonly string[];
	readonly user: string;
}

export interface ReactionRole {
	readonly channel: string;
	readonly emoji: SerializedEmoji;
	readonly message: string | null;
	readonly role: string;
}

export interface UniqueRoleSet {
	readonly name: string;
	readonly roles: readonly string[];
}
