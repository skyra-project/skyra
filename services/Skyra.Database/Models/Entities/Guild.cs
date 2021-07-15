using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Skyra.Database.Models.Entities
{
	[Table("guilds")]
	public class Guild
	{
		[Key]
		[Column("id")]
		[StringLength(19)]
		public string Id { get; set; } = null!;

		[Required]
		[Column("prefix")]
		[StringLength(10)]
		public string Prefix { get; set; } = null!;

		[Required]
		[Column("language")]
		public string Language { get; set; } = null!;

		[Column("disable-natural-prefix")]
		public bool DisableNaturalPrefix { get; set; }

		[Required]
		[Column("disabled-commands", TypeName = "character varying(32)[]")]
		public string[] DisabledCommands { get; set; } = Array.Empty<string>();

		[Column("afk.role")]
		[StringLength(19)]
		public string? AfkRole { get; set; }

		[Column("afk.prefix")]
		[StringLength(32)]
		public string? AfkPrefix { get; set; }

		[Required]
		[Column("afk.prefix-force")]
		public bool AfkPrefixForce { get; set; }

		[Required]
		[Column("custom-commands", TypeName = "jsonb")]
		public string CustomCommands { get; set; } = null!;

		[Required]
		[Column("permissions.users", TypeName = "jsonb")]
		public string PermissionsUsers { get; set; } = null!;

		[Required]
		[Column("permissions.roles", TypeName = "jsonb")]
		public string PermissionsRoles { get; set; } = null!;

		[Column("channels.announcements")]
		[StringLength(19)]
		public string? ChannelsAnnouncements { get; set; }

		[Column("channels.greeting")]
		[StringLength(19)]
		public string? ChannelsGreeting { get; set; }

		[Column("channels.farewell")]
		[StringLength(19)]
		public string? ChannelsFarewell { get; set; }

		[Column("channels.spam")]
		[StringLength(19)]
		public string? ChannelsSpam { get; set; }

		[Column("channels.logs.moderation")]
		[StringLength(19)]
		public string? ChannelsLogsModeration { get; set; }

		[Column("channels.logs.image")]
		[StringLength(19)]
		public string? ChannelsLogsImage { get; set; }

		[Column("channels.logs.member-add")]
		[StringLength(19)]
		public string? ChannelsLogsMemberAdd { get; set; }

		[Column("channels.logs.member-remove")]
		[StringLength(19)]
		public string? ChannelsLogsMemberRemove { get; set; }

		[Column("channels.logs.member-nickname-update")]
		[StringLength(19)]
		public string? ChannelsLogsMemberNickNameUpdate { get; set; }

		[Column("channels.logs.member-username-update")]
		[StringLength(19)]
		public string? ChannelsLogsMemberUserNameUpdate { get; set; }

		[Column("channels.logs.member-roles-update")]
		[StringLength(19)]
		public string? ChannelsLogsMemberRoleUpdate { get; set; }

		[Column("channels.logs.message-delete")]
		[StringLength(19)]
		public string? ChannelsLogsMessageDelete { get; set; }

		[Column("channels.logs.message-delete-nsfw")]
		[StringLength(19)]
		public string? ChannelsLogsMessageDeleteNsfw { get; set; }

		[Column("channels.logs.message-update")]
		[StringLength(19)]
		public string? ChannelsLogsMessageUpdate { get; set; }

		[Column("channels.logs.message-update-nsfw")]
		[StringLength(19)]
		public string? ChannelsLogsMessageUpdateNsfw { get; set; }

		[Column("channels.logs.prune")]
		[StringLength(19)]
		public string? ChannelsLogsPrune { get; set; }

		[Column("channels.logs.reaction")]
		[StringLength(19)]
		public string? ChannelsLogsReaction { get; set; }

		[Column("channels.logs.role-create")]
		[StringLength(19)]
		public string? ChannelsLogsRoleCreate { get; set; }

		[Column("channels.logs.role-update")]
		[StringLength(19)]
		public string? ChannelsLogsRoleUpdate { get; set; }

		[Column("channels.logs.role-delete")]
		[StringLength(19)]
		public string? ChannelsLogsRoleDelete { get; set; }

		[Column("channels.logs.channel-create")]
		[StringLength(19)]
		public string? ChannelsLogsChannelCreate { get; set; }

		[Column("channels.logs.channel-update")]
		[StringLength(19)]
		public string? ChannelsLogsChannelUpdate { get; set; }

		[Column("channels.logs.channel-delete")]
		[StringLength(19)]
		public string? ChannelsLogsChannelDelete { get; set; }

		[Column("channels.logs.emoji-create")]
		[StringLength(19)]
		public string? ChannelsLogsEmojiCreate { get; set; }

		[Column("channels.logs.emoji-update")]
		[StringLength(19)]
		public string? ChannelsLogsEmojiUpdate { get; set; }

		[Column("channels.logs.emoji-delete")]
		[StringLength(19)]
		public string? ChannelsLogsEmojiDelete { get; set; }

		[Column("channels.logs.server-update")]
		[StringLength(19)]
		public string? ChannelsLogsServerUpdate { get; set; }

		[Required]
		[Column("channels.ignore.all", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreAll { get; set; } = Array.Empty<string>();

		[Required]
		[Column("channels.ignore.message-edit", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreMessageEdit { get; set; } = Array.Empty<string>();

		[Required]
		[Column("channels.ignore.message-delete", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreMessageDelete { get; set; } = Array.Empty<string>();

		[Required]
		[Column("channels.ignore.reaction-add", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreReactionAdd { get; set; } = Array.Empty<string>();

		[Required]
		[Column("command-auto-delete", TypeName = "jsonb")]
		public string CommandAutodelete { get; set; } = null!;

		[Required]
		[Column("disabled-channels", TypeName = "character varying(19)[]")]
		public string[] DisabledChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("disabled-commands-channels", TypeName = "jsonb")]
		public string DisabledCommandsChannels { get; set; } = null!;

		[Required]
		[Column("events.ban-add")]
		public bool EventsBanAdd { get; set; }

		[Required]
		[Column("events.ban-remove")]
		public bool EventsBanRemove { get; set; }

		[Required]
		[Column("events.twemoji-reactions")]
		public bool EventsTwemojiReactions { get; set; }

		[Column("messages.farewell")]
		[StringLength(2000)]
		public string? MessagesFarewell { get; set; }

		[Column("messages.farewell-auto-delete")]
		public long? MessagesFarewellAutoDelete { get; set; }

		[Column("messages.greeting")]
		[StringLength(2000)]
		public string? MessagesGreeting { get; set; }

		[Column("messages.greeting-auto-delete")]
		public long? MessagesGreetingAutoDelete { get; set; }

		[Column("messages.join-dm")]
		[StringLength(1500)]
		public string? MessagesJoinDm { get; set; }

		[Required]
		[Column("messages.ignore-channels", TypeName = "character varying(19)[]")]
		public string[] MessagesIgnoreChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("messages.announcement-embed")]
		public bool MessagesAnnouncementEmbed { get; set; }

		[Required]
		[Column("messages.moderation-dm")]
		public bool MessagesModerationDm { get; set; }

		[Required]
		[Column("messages.moderation-reason-display")]
		public bool? MessagesModerationReasonDisplay { get; set; }

		[Required]
		[Column("messages.moderation-message-display")]
		public bool? MessagesModerationMessageDisplay { get; set; }

		[Required]
		[Column("messages.moderation-auto-delete")]
		public bool MessagesModerationAutoDelete { get; set; }

		[Required]
		[Column("messages.moderator-name-display")]
		public bool? MessagesModeratorNameDisplay { get; set; }

		[Required]
		[Column("messages.auto-delete.ignored-all")]
		public bool? MessagesAutoDeleteIgnoredAll { get; set; }

		[Required]
		[Column("messages.auto-delete.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] MessagesAutoDeleteIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("messages.auto-delete.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] MessagesAutoDeleteIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("messages.auto-delete.ignored-commands", TypeName = "character varying(32)[]")]
		public string[] MessagesAutoDeleteIgnoredCommands { get; set; } = Array.Empty<string>();

		[Required]
		[Column("sticky-roles", TypeName = "jsonb")]
		public string StickyRoles { get; set; } = null!;

		[Required]
		[Column("reaction-roles", TypeName = "jsonb")]
		public string ReactionRoles { get; set; } = null!;

		[Required]
		[Column("roles.admin", TypeName = "character varying(19)[]")]
		public string[] RolesAdmin { get; set; } = Array.Empty<string>();

		[Required]
		[Column("roles.auto", TypeName = "jsonb")]
		public string RolesAuto { get; set; } = null!;

		[Column("roles.initial")]
		[StringLength(19)]
		public string? RolesInitial { get; set; }

		[Column("roles.initial-humans")]
		[StringLength(19)]
		public string? rolesInitialHumans { get; set; }

		[Column("roles.initial-bots")]
		[StringLength(19)]
		public string? rolesInitialBots { get; set; }

		[Required]
		[Column("roles.moderator", TypeName = "character varying(19)[]")]
		public string[] RolesModerator { get; set; } = Array.Empty<string>();

		[Column("roles.muted")]
		[StringLength(19)]
		public string? RolesMuted { get; set; }

		[Column("roles.restricted-reaction")]
		[StringLength(19)]
		public string? RolesRestrictedReaction { get; set; }

		[Column("roles.restricted-embed")]
		[StringLength(19)]
		public string? RolesRestrictedEmbed { get; set; }

		[Column("roles.restricted-emoji")]
		[StringLength(19)]
		public string? RolesRestrictedEmoji { get; set; }

		[Column("roles.restricted-attachment")]
		[StringLength(19)]
		public string? RolesRestrictedAttachment { get; set; }

		[Column("roles.restricted-voice")]
		[StringLength(19)]
		public string? RolesRestrictedVoice { get; set; }

		[Required]
		[Column("roles.public", TypeName = "character varying(19)[]")]
		public string[] RolesPublic { get; set; } = Array.Empty<string>();

		[Required]
		[Column("roles.remove-initial")]
		public bool RolesRemoveInitial { get; set; }

		[Required]
		[Column("roles.dj", TypeName = "character varying(19)[]")]
		public string[] RolesDj { get; set; } = Array.Empty<string>();

		[Column("roles.subscriber")]
		[StringLength(19)]
		public string? RolesSubscriber { get; set; }

		[Required]
		[Column("roles.unique-role-sets", TypeName = "jsonb")]
		public string RolesUniqueRoleSets { get; set; } = null!;

		[Required]
		[Column("selfmod.attachments.enabled")]
		public bool SelfmodAttachmentsEnabled { get; set; }

		[Required]
		[Column("selfmod.attachments.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodAttachmentsIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.attachments.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodAttachmentsIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.attachments.soft-action")]
		public short SelfmodAttachmentsSoftAction { get; set; }

		[Required]
		[Column("selfmod.attachments.hard-action")]
		public short SelfmodAttachmentsHardAction { get; set; }

		[Column("selfmod.attachments.hard-action-duration")]
		public long? SelfmodAttachmentsHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.attachments.threshold-maximum")]
		public short SelfmodAttachmentsThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.attachments.threshold-duration")]
		public int SelfmodAttachmentsThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.capitals.enabled")]
		public bool SelfmodCapitalsEnabled { get; set; }

		[Required]
		[Column("selfmod.capitals.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodCapitalsIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.capitals.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodCapitalsIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.capitals.minimum")]
		public short SelfmodCapitalsMinimum { get; set; }

		[Required]
		[Column("selfmod.capitals.maximum")]
		public short SelfmodCapitalsMaximum { get; set; }

		[Required]
		[Column("selfmod.capitals.soft-action")]
		public short SelfmodCapitalsSoftAction { get; set; }

		[Required]
		[Column("selfmod.capitals.hard-action")]
		public short SelfmodCapitalsHardAction { get; set; }

		[Column("selfmod.capitals.hard-action-duration")]
		public long? SelfmodCapitalsHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.capitals.threshold-maximum")]
		public short SelfmodCapitalsThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.capitals.threshold-duration")]
		public int SelfmodCapitalsThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.links.enabled")]
		public bool SelfmodLinksEnabled { get; set; }

		[Required]
		[Column("selfmod.links.allowed", TypeName = "character varying(128)[]")]
		public string[] SelfmodLinksAllowed { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.links.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodLinksIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.links.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodLinksIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.links.soft-action")]
		public short SelfmodLinksSoftAction { get; set; }

		[Required]
		[Column("selfmod.links.hard-action")]
		public short SelfmodLinksHardAction { get; set; }

		[Column("selfmod.links.hard-action-duration")]
		public long? SelfmodLinksHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.links.threshold-maximum")]
		public short SelfmodLinksThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.links.threshold-duration")]
		public int SelfmodLinksThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.messages.enabled")]
		public bool SelfmodMessagesEnabled { get; set; }

		[Required]
		[Column("selfmod.messages.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodMessagesIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.messages.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodMessagesIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.messages.maximum")]
		public short SelfmodMessagesMaximum { get; set; }

		[Required]
		[Column("selfmod.messages.queue-size")]
		public short SelfmodMessagesQueueSize { get; set; }

		[Required]
		[Column("selfmod.messages.soft-action")]
		public short SelfmodMessagesSoftAction { get; set; }

		[Required]
		[Column("selfmod.messages.hard-action")]
		public short SelfmodMessagesHardAction { get; set; }

		[Column("selfmod.messages.hard-action-duration")]
		public long? SelfmodMessagesHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.messages.threshold-maximum")]
		public short SelfmodMessagesThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.messages.threshold-duration")]
		public int SelfmodMessagesThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.newlines.enabled")]
		public bool SelfmodNewlinesEnabled { get; set; }

		[Required]
		[Column("selfmod.newlines.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodNewlinesIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.newlines.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodNewlinesIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.newlines.maximum")]
		public short SelfmodNewlinesMaximum { get; set; }

		[Required]
		[Column("selfmod.newlines.soft-action")]
		public short SelfmodNewlinesSoftAction { get; set; }

		[Required]
		[Column("selfmod.newlines.hard-action")]
		public short SelfmodNewlinesHardAction { get; set; }

		[Column("selfmod.newlines.hard-action-duration")]
		public long? SelfmodNewlinesHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.newlines.threshold-maximum")]
		public short SelfmodNewlinesThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.newlines.threshold-duration")]
		public int SelfmodNewlinesThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.invites.enabled")]
		public bool SelfmodInvitesEnabled { get; set; }

		[Required]
		[Column("selfmod.invites.ignored-codes", TypeName = "character varying[]")]
		public string[] SelfmodInvitesIgnoredCodes { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.invites.ignored-guilds", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredGuilds { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.invites.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.invites.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.invites.soft-action")]
		public short SelfmodInvitesSoftAction { get; set; }

		[Required]
		[Column("selfmod.invites.hard-action")]
		public short SelfmodInvitesHardAction { get; set; }

		[Column("selfmod.invites.hard-action-duration")]
		public long? SelfmodInvitesHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.invites.threshold-maximum")]
		public short SelfmodInvitesThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.invites.threshold-duration")]
		public int SelfmodInvitesThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.filter.enabled")]
		public bool SelfmodFilterEnabled { get; set; }

		[Required]
		[Column("selfmod.filter.raw", TypeName = "character varying(32)[]")]
		public string[] SelfmodFilterRaw { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.filter.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodFilterIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.filter.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodFilterIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.filter.soft-action")]
		public short SelfmodFilterSoftAction { get; set; }

		[Required]
		[Column("selfmod.filter.hard-action")]
		public short SelfmodFilterHardAction { get; set; }

		[Column("selfmod.filter.hard-action-duration")]
		public long? SelfmodFilterHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.filter.threshold-maximum")]
		public short SelfmodFilterThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.filter.threshold-duration")]
		public int SelfmodFilterThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.reactions.enabled")]
		public bool SelfmodReactionsEnabled { get; set; }

		[Required]
		[Column("selfmod.reactions.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SelfmodReactionsIgnoredRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.reactions.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodReactionsIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.reactions.maximum")]
		public short SelfmodReactionsMaximum { get; set; }

		[Required]
		[Column("selfmod.reactions.allowed", TypeName = "character varying(128)[]")]
		public string[] SelfmodReactionsAllowed { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.reactions.blocked", TypeName = "character varying(128)[]")]
		public string[] SelfmodReactionsBlocked { get; set; } = Array.Empty<string>();

		[Required]
		[Column("selfmod.reactions.soft-action")]
		public short SelfmodReactionsSoftAction { get; set; }

		[Required]
		[Column("selfmod.reactions.hard-action")]
		public short SelfmodReactionsHardAction { get; set; }

		[Column("selfmod.reactions.hard-action-duration")]
		public long? SelfmodReactionsHardActionDuration { get; set; }

		[Required]
		[Column("selfmod.reactions.threshold-maximum")]
		public short SelfmodReactionsThresholdMaximum { get; set; }

		[Required]
		[Column("selfmod.reactions.threshold-duration")]
		public int SelfmodReactionsThresholdDuration { get; set; }

		[Required]
		[Column("selfmod.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SelfmodIgnoreChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("no-mention-spam.enabled")]
		public bool NoMentionSpamEnabled { get; set; }

		[Required]
		[Column("no-mention-spam.alerts")]
		public bool NoMentionSpamAlerts { get; set; }

		[Required]
		[Column("no-mention-spam.mentions-allowed")]
		public short NoMentionSpamMentionsAllowed { get; set; }

		[Required]
		[Column("no-mention-spam.time-period")]
		public int NoMentionSpamTimePeriod { get; set; }

		[Required]
		[Column("social.enabled")]
		public bool? SocialEnabled { get; set; }

		[Column("social.achieve-role")]
		public string? SocialAchieveRole { get; set; }

		[Column("social.achieve-level")]
		public string? SocialAchieveLevel { get; set; }

		[Column("social.achieve-channel")]
		[StringLength(19)]
		public string? SocialAchieveChannel { get; set; }

		[Column("social.achieve-multiple")]
		public short SocialAchieveMultiple { get; set; } = 1;

		[Required]
		[Column("social.multiplier")]
		public decimal SocialMultiplier { get; set; }

		[Required]
		[Column("social.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] SocialIgnoredChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("social.ignored-roles", TypeName = "character varying(19)[]")]
		public string[] SocialIgnoredRoles { get; set; } = Array.Empty<string>();

		[Column("starboard.channel")]
		[StringLength(19)]
		public string? StarboardChannel { get; set; }

		[Required]
		[Column("starboard.emoji")]
		[StringLength(75)]
		public string StarboardEmoji { get; set; } = null!;

		[Required]
		[Column("starboard.ignored-channels", TypeName = "character varying(19)[]")]
		public string[] StarboardIgnoreChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("starboard.minimum")]
		public short StarboardMinimum { get; set; }

		[Required]
		[Column("starboard.self-star")]
		public bool StarboardSelfStar { get; set; }

		[Column("starboard.maximum-age")]
		public long? StarboardMaximumAge { get; set; }

		[Required]
		[Column("trigger.alias", TypeName = "jsonb")]
		public string TriggerAlias { get; set; } = null!;

		[Required]
		[Column("trigger.includes", TypeName = "jsonb")]
		public string TriggerIncludes { get; set; } = null!;

		[Required]
		[Column("music.default-volume")]
		public short MusicDefaultVolume { get; set; }

		[Required]
		[Column("music.maximum-duration")]
		public int MusicMaximumDuration { get; set; }

		[Required]
		[Column("music.maximum-entries-per-user")]
		public short MusicMaximumEntriesPerUser { get; set; }

		[Required]
		[Column("music.allow-streams")]
		public bool? MusicAllowStreams { get; set; }

		[Required]
		[Column("music.allowed-voice-channels", TypeName = "character varying(19)[]")]
		public string[] MusicAllowedVoiceChannels { get; set; } = Array.Empty<string>();

		[Required]
		[Column("music.allowed-roles", TypeName = "character varying(19)[]")]
		public string[] MusicAllowedRoles { get; set; } = Array.Empty<string>();

		[Required]
		[Column("notifications.streams.twitch.streamers", TypeName = "jsonb")]
		public string NotificationsStreamsTwitchStreamers { get; set; } = null!;

		[Required]
		[Column("suggestions.emojis.upvote")]
		[StringLength(128)]
		public string SuggestionsEmojisUpvote { get; set; } = null!;

		[Required]
		[Column("suggestions.emojis.downvote")]
		[StringLength(128)]
		public string SuggestionsEmojisDownvote { get; set; } = null!;

		[Column("suggestions.channel")]
		[StringLength(19)]
		public string? SuggestionsChannel { get; set; }

		[Column("suggestions.on-action.dm")]
		public bool SuggestionsOnActionDm { get; set; }

		[Column("suggestions.on-action.repost")]
		public bool SuggestionsOnActionRepost { get; set; }

		[Column("suggestions.on-action.hide-author")]
		public bool SuggestionsOnActionHideAuthor { get; set; }

		[Required]
		[Column("events.member-username-update")]
		public bool EventsMemberUsernameUpdate { get; set; }

		[Column("birthday.channel")]
		[StringLength(19)]
		public string? BirthdayChannel { get; set; }

		[Column("birthday.message")]
		[StringLength(200)]
		public string? BirthdayMessage { get; set; }

		[Column("birthday.role")]
		[StringLength(19)]
		public string? BirthdayRole { get; set; }
	}
}
