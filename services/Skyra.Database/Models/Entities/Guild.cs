using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("guilds")]
	public class Guild
	{
		[Key]
		[Column("id")]
		[StringLength(19)]
		public string Id { get; set; }

		[Required]
		[Column("prefix")]
		[StringLength(10)]
		public string Prefix { get; set; }

		[Required]
		[Column("language")]
		[StringLength(5)]
		public string Language { get; set; }

		[Column("disableNaturalPrefix")]
		public bool DisableNaturalPrefix { get; set; }

		[Required]
		[Column("disabledCommands", TypeName = "character varying(32)[]")]
		public string[] DisabledCommands { get; set; }

		[Required]
		[Column("custom-commands", TypeName = "jsonb")]
		public string CustomCommands { get; set; }

		[Required]
		[Column("permissions.users", TypeName = "jsonb")]
		public string PermissionsUsers { get; set; }

		[Required]
		[Column("permissions.roles", TypeName = "jsonb")]
		public string PermissionsRoles { get; set; }

		[Column("channels.announcements")]
		[StringLength(19)]
		public string ChannelsAnnouncements { get; set; }

		[Column("channels.greeting")]
		[StringLength(19)]
		public string ChannelsGreeting { get; set; }

		[Column("channels.farewell")]
		[StringLength(19)]
		public string ChannelsFarewell { get; set; }

		[Column("channels.member-logs")]
		[StringLength(19)]
		public string ChannelsMemberLogs { get; set; }

		[Column("channels.message-logs")]
		[StringLength(19)]
		public string ChannelsMessageLogs { get; set; }

		[Column("channels.moderation-logs")]
		[StringLength(19)]
		public string ChannelsModerationLogs { get; set; }

		[Column("channels.nsfw-message-logs")]
		[StringLength(19)]
		public string ChannelsNsfwMessageLogs { get; set; }

		[Column("channels.image-logs")]
		[StringLength(19)]
		public string ChannelsImageLogs { get; set; }

		[Column("channels.prune-logs")]
		[StringLength(19)]
		public string ChannelsPruneLogs { get; set; }

		[Column("channels.reaction-logs")]
		[StringLength(19)]
		public string ChannelsReactionLogs { get; set; }

		[Column("channels.spam")]
		[StringLength(19)]
		public string ChannelsSpam { get; set; }

		[Required]
		[Column("channels.ignore.all", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreAll { get; set; }

		[Required]
		[Column("channels.ignore.message-edit", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreMessageEdit { get; set; }

		[Required]
		[Column("channels.ignore.message-delete", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreMessageDelete { get; set; }

		[Required]
		[Column("channels.ignore.reaction-add", TypeName = "character varying(19)[]")]
		public string[] ChannelsIgnoreReactionAdd { get; set; }

		[Required]
		[Column("command-autodelete", TypeName = "jsonb")]
		public string CommandAutodelete { get; set; }

		[Required]
		[Column("disabledChannels", TypeName = "character varying(19)[]")]
		public string[] DisabledChannels { get; set; }

		[Required]
		[Column("disabledCommandsChannels", TypeName = "jsonb")]
		public string DisabledCommandsChannels { get; set; }

		[Column("events.banAdd")]
		public bool EventsBanAdd { get; set; }

		[Column("events.banRemove")]
		public bool EventsBanRemove { get; set; }

		[Column("events.memberAdd")]
		public bool EventsMemberAdd { get; set; }

		[Column("events.memberRemove")]
		public bool EventsMemberRemove { get; set; }

		[Column("events.member-nickname-update")]
		public bool EventsMemberNicknameUpdate { get; set; }

		[Column("events.memberRoleUpdate")]
		public bool EventsMemberRoleUpdate { get; set; }

		[Column("events.messageDelete")]
		public bool EventsMessageDelete { get; set; }

		[Column("events.messageEdit")]
		public bool EventsMessageEdit { get; set; }

		[Column("events.twemoji-reactions")]
		public bool EventsTwemojiReactions { get; set; }

		[Column("messages.farewell")]
		[StringLength(2000)]
		public string MessagesFarewell { get; set; }

		[Column("messages.greeting")]
		[StringLength(2000)]
		public string MessagesGreeting { get; set; }

		[Column("messages.join-dm")]
		[StringLength(1500)]
		public string MessagesJoinDm { get; set; }

		[Required]
		[Column("messages.ignoreChannels", TypeName = "character varying(19)[]")]
		public string[] MessagesIgnoreChannels { get; set; }

		[Column("messages.announcement-embed")]
		public bool MessagesAnnouncementEmbed { get; set; }

		[Column("messages.moderation-dm")]
		public bool MessagesModerationDm { get; set; }

		[Required]
		[Column("messages.moderation-reason-display")]
		public bool? MessagesModerationReasonDisplay { get; set; }

		[Required]
		[Column("messages.moderation-message-display")]
		public bool? MessagesModerationMessageDisplay { get; set; }

		[Column("messages.moderation-auto-delete")]
		public bool MessagesModerationAutoDelete { get; set; }

		[Required]
		[Column("messages.moderator-name-display")]
		public bool? MessagesModeratorNameDisplay { get; set; }

		[Required]
		[Column("stickyRoles", TypeName = "jsonb")]
		public string StickyRoles { get; set; }

		[Required]
		[Column("reaction-roles", TypeName = "jsonb")]
		public string ReactionRoles { get; set; }

		[Required]
		[Column("roles.admin", TypeName = "character varying(19)[]")]
		public string[] RolesAdmin { get; set; }

		[Required]
		[Column("roles.auto", TypeName = "jsonb")]
		public string RolesAuto { get; set; }

		[Column("roles.initial")]
		[StringLength(19)]
		public string RolesInitial { get; set; }

		[Required]
		[Column("roles.moderator", TypeName = "character varying(19)[]")]
		public string[] RolesModerator { get; set; }

		[Column("roles.muted")]
		[StringLength(19)]
		public string RolesMuted { get; set; }

		[Column("roles.restricted-reaction")]
		[StringLength(19)]
		public string RolesRestrictedReaction { get; set; }

		[Column("roles.restricted-embed")]
		[StringLength(19)]
		public string RolesRestrictedEmbed { get; set; }

		[Column("roles.restricted-emoji")]
		[StringLength(19)]
		public string RolesRestrictedEmoji { get; set; }

		[Column("roles.restricted-attachment")]
		[StringLength(19)]
		public string RolesRestrictedAttachment { get; set; }

		[Column("roles.restricted-voice")]
		[StringLength(19)]
		public string RolesRestrictedVoice { get; set; }

		[Required]
		[Column("roles.public", TypeName = "character varying(19)[]")]
		public string[] RolesPublic { get; set; }

		[Column("roles.removeInitial")]
		public bool RolesRemoveInitial { get; set; }

		[Required]
		[Column("roles.dj", TypeName = "character varying(19)[]")]
		public string[] RolesDj { get; set; }

		[Column("roles.subscriber")]
		[StringLength(19)]
		public string RolesSubscriber { get; set; }

		[Required]
		[Column("roles.uniqueRoleSets", TypeName = "jsonb")]
		public string RolesUniqueRoleSets { get; set; }

		[Column("selfmod.attachments.enabled")]
		public bool SelfmodAttachmentsEnabled { get; set; }

		[Required]
		[Column("selfmod.attachments.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodAttachmentsIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.attachments.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodAttachmentsIgnoredChannels { get; set; }

		[Column("selfmod.attachments.softAction")]
		public short SelfmodAttachmentsSoftAction { get; set; }

		[Column("selfmod.attachments.hardAction")]
		public short SelfmodAttachmentsHardAction { get; set; }

		[Column("selfmod.attachments.hardActionDuration")]
		public int? SelfmodAttachmentsHardActionDuration { get; set; }

		[Column("selfmod.attachments.thresholdMaximum")]
		public short SelfmodAttachmentsThresholdMaximum { get; set; }

		[Column("selfmod.attachments.thresholdDuration")]
		public int SelfmodAttachmentsThresholdDuration { get; set; }

		[Column("selfmod.capitals.enabled")]
		public bool SelfmodCapitalsEnabled { get; set; }

		[Required]
		[Column("selfmod.capitals.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodCapitalsIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.capitals.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodCapitalsIgnoredChannels { get; set; }

		[Column("selfmod.capitals.minimum")]
		public short SelfmodCapitalsMinimum { get; set; }

		[Column("selfmod.capitals.maximum")]
		public short SelfmodCapitalsMaximum { get; set; }

		[Column("selfmod.capitals.softAction")]
		public short SelfmodCapitalsSoftAction { get; set; }

		[Column("selfmod.capitals.hardAction")]
		public short SelfmodCapitalsHardAction { get; set; }

		[Column("selfmod.capitals.hardActionDuration")]
		public int? SelfmodCapitalsHardActionDuration { get; set; }

		[Column("selfmod.capitals.thresholdMaximum")]
		public short SelfmodCapitalsThresholdMaximum { get; set; }

		[Column("selfmod.capitals.thresholdDuration")]
		public int SelfmodCapitalsThresholdDuration { get; set; }

		[Column("selfmod.links.enabled")]
		public bool SelfmodLinksEnabled { get; set; }

		[Required]
		[Column("selfmod.links.whitelist", TypeName = "character varying(128)[]")]
		public string[] SelfmodLinksWhitelist { get; set; }

		[Required]
		[Column("selfmod.links.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodLinksIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.links.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodLinksIgnoredChannels { get; set; }

		[Column("selfmod.links.softAction")]
		public short SelfmodLinksSoftAction { get; set; }

		[Column("selfmod.links.hardAction")]
		public short SelfmodLinksHardAction { get; set; }

		[Column("selfmod.links.hardActionDuration")]
		public int? SelfmodLinksHardActionDuration { get; set; }

		[Column("selfmod.links.thresholdMaximum")]
		public short SelfmodLinksThresholdMaximum { get; set; }

		[Column("selfmod.links.thresholdDuration")]
		public int SelfmodLinksThresholdDuration { get; set; }

		[Column("selfmod.messages.enabled")]
		public bool SelfmodMessagesEnabled { get; set; }

		[Required]
		[Column("selfmod.messages.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodMessagesIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.messages.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodMessagesIgnoredChannels { get; set; }

		[Column("selfmod.messages.maximum")]
		public short SelfmodMessagesMaximum { get; set; }

		[Column("selfmod.messages.queue-size")]
		public short SelfmodMessagesQueueSize { get; set; }

		[Column("selfmod.messages.softAction")]
		public short SelfmodMessagesSoftAction { get; set; }

		[Column("selfmod.messages.hardAction")]
		public short SelfmodMessagesHardAction { get; set; }

		[Column("selfmod.messages.hardActionDuration")]
		public int? SelfmodMessagesHardActionDuration { get; set; }

		[Column("selfmod.messages.thresholdMaximum")]
		public short SelfmodMessagesThresholdMaximum { get; set; }

		[Column("selfmod.messages.thresholdDuration")]
		public int SelfmodMessagesThresholdDuration { get; set; }

		[Column("selfmod.newlines.enabled")]
		public bool SelfmodNewlinesEnabled { get; set; }

		[Required]
		[Column("selfmod.newlines.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodNewlinesIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.newlines.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodNewlinesIgnoredChannels { get; set; }

		[Column("selfmod.newlines.maximum")]
		public short SelfmodNewlinesMaximum { get; set; }

		[Column("selfmod.newlines.softAction")]
		public short SelfmodNewlinesSoftAction { get; set; }

		[Column("selfmod.newlines.hardAction")]
		public short SelfmodNewlinesHardAction { get; set; }

		[Column("selfmod.newlines.hardActionDuration")]
		public int? SelfmodNewlinesHardActionDuration { get; set; }

		[Column("selfmod.newlines.thresholdMaximum")]
		public short SelfmodNewlinesThresholdMaximum { get; set; }

		[Column("selfmod.newlines.thresholdDuration")]
		public int SelfmodNewlinesThresholdDuration { get; set; }

		[Column("selfmod.invites.enabled")]
		public bool SelfmodInvitesEnabled { get; set; }

		[Required]
		[Column("selfmod.invites.ignoredCodes", TypeName = "character varying[]")]
		public string[] SelfmodInvitesIgnoredCodes { get; set; }

		[Required]
		[Column("selfmod.invites.ignoredGuilds", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredGuilds { get; set; }

		[Required]
		[Column("selfmod.invites.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.invites.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodInvitesIgnoredChannels { get; set; }

		[Column("selfmod.invites.softAction")]
		public short SelfmodInvitesSoftAction { get; set; }

		[Column("selfmod.invites.hardAction")]
		public short SelfmodInvitesHardAction { get; set; }

		[Column("selfmod.invites.hardActionDuration")]
		public int? SelfmodInvitesHardActionDuration { get; set; }

		[Column("selfmod.invites.thresholdMaximum")]
		public short SelfmodInvitesThresholdMaximum { get; set; }

		[Column("selfmod.invites.thresholdDuration")]
		public int SelfmodInvitesThresholdDuration { get; set; }

		[Column("selfmod.filter.enabled")]
		public bool SelfmodFilterEnabled { get; set; }

		[Required]
		[Column("selfmod.filter.raw", TypeName = "character varying(32)[]")]
		public string[] SelfmodFilterRaw { get; set; }

		[Required]
		[Column("selfmod.filter.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodFilterIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.filter.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodFilterIgnoredChannels { get; set; }

		[Column("selfmod.filter.softAction")]
		public short SelfmodFilterSoftAction { get; set; }

		[Column("selfmod.filter.hardAction")]
		public short SelfmodFilterHardAction { get; set; }

		[Column("selfmod.filter.hardActionDuration")]
		public int? SelfmodFilterHardActionDuration { get; set; }

		[Column("selfmod.filter.thresholdMaximum")]
		public short SelfmodFilterThresholdMaximum { get; set; }

		[Column("selfmod.filter.thresholdDuration")]
		public int SelfmodFilterThresholdDuration { get; set; }

		[Column("selfmod.reactions.enabled")]
		public bool SelfmodReactionsEnabled { get; set; }

		[Required]
		[Column("selfmod.reactions.ignoredRoles", TypeName = "character varying(19)[]")]
		public string[] SelfmodReactionsIgnoredRoles { get; set; }

		[Required]
		[Column("selfmod.reactions.ignoredChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodReactionsIgnoredChannels { get; set; }

		[Column("selfmod.reactions.maximum")]
		public short SelfmodReactionsMaximum { get; set; }

		[Required]
		[Column("selfmod.reactions.whitelist", TypeName = "character varying(128)[]")]
		public string[] SelfmodReactionsWhitelist { get; set; }

		[Required]
		[Column("selfmod.reactions.blacklist", TypeName = "character varying(128)[]")]
		public string[] SelfmodReactionsBlacklist { get; set; }

		[Column("selfmod.reactions.softAction")]
		public short SelfmodReactionsSoftAction { get; set; }

		[Column("selfmod.reactions.hardAction")]
		public short SelfmodReactionsHardAction { get; set; }

		[Column("selfmod.reactions.hardActionDuration")]
		public int? SelfmodReactionsHardActionDuration { get; set; }

		[Column("selfmod.reactions.thresholdMaximum")]
		public short SelfmodReactionsThresholdMaximum { get; set; }

		[Column("selfmod.reactions.thresholdDuration")]
		public int SelfmodReactionsThresholdDuration { get; set; }

		[Column("selfmod.raid")]
		public bool SelfmodRaid { get; set; }

		[Column("selfmod.raidthreshold")]
		public short SelfmodRaidthreshold { get; set; }

		[Required]
		[Column("selfmod.ignoreChannels", TypeName = "character varying(19)[]")]
		public string[] SelfmodIgnoreChannels { get; set; }

		[Column("no-mention-spam.enabled")]
		public bool NoMentionSpamEnabled { get; set; }

		[Column("no-mention-spam.alerts")]
		public bool NoMentionSpamAlerts { get; set; }

		[Column("no-mention-spam.mentionsAllowed")]
		public short NoMentionSpamMentionsAllowed { get; set; }

		[Column("no-mention-spam.timePeriod")]
		public int NoMentionSpamTimePeriod { get; set; }

		[Required]
		[Column("social.enabled")]
		public bool? SocialEnabled { get; set; }

		[Column("social.achieve")]
		public bool SocialAchieve { get; set; }

		[Column("social.achieveMessage")]
		[StringLength(2000)]
		public string SocialAchieveMessage { get; set; }

		[Column("social.multiplier")]
		public decimal SocialMultiplier { get; set; }

		[Required]
		[Column("social.ignoreChannels", TypeName = "character varying(19)[]")]
		public string[] SocialIgnoreChannels { get; set; }

		[Column("starboard.channel")]
		[StringLength(19)]
		public string StarboardChannel { get; set; }

		[Required]
		[Column("starboard.emoji")]
		[StringLength(75)]
		public string StarboardEmoji { get; set; }

		[Required]
		[Column("starboard.ignoreChannels", TypeName = "character varying(19)[]")]
		public string[] StarboardIgnoreChannels { get; set; }

		[Column("starboard.minimum")]
		public short StarboardMinimum { get; set; }

		[Column("starboard.selfStar")]
		public bool StarboardSelfStar { get; set; }

		[Required]
		[Column("trigger.alias", TypeName = "jsonb")]
		public string TriggerAlias { get; set; }

		[Required]
		[Column("trigger.includes", TypeName = "jsonb")]
		public string TriggerIncludes { get; set; }

		[Column("music.default-volume")]
		public short MusicDefaultVolume { get; set; }

		[Column("music.maximum-duration")]
		public int MusicMaximumDuration { get; set; }

		[Column("music.maximum-entries-per-user")]
		public short MusicMaximumEntriesPerUser { get; set; }

		[Required]
		[Column("music.allow-streams")]
		public bool? MusicAllowStreams { get; set; }

		[Required]
		[Column("notifications.streams.twitch.streamers", TypeName = "jsonb")]
		public string NotificationsStreamsTwitchStreamers { get; set; }

		[Required]
		[Column("suggestions.emojis.upvote")]
		[StringLength(128)]
		public string SuggestionsEmojisUpvote { get; set; }

		[Required]
		[Column("suggestions.emojis.downvote")]
		[StringLength(128)]
		public string SuggestionsEmojisDownvote { get; set; }

		[Column("suggestions.channel")]
		[StringLength(19)]
		public string SuggestionsChannel { get; set; }

		[Column("suggestions.on-action.dm")]
		public bool SuggestionsOnActionDm { get; set; }

		[Column("suggestions.on-action.repost")]
		public bool SuggestionsOnActionRepost { get; set; }

		[Column("suggestions.on-action.hide-author")]
		public bool SuggestionsOnActionHideAuthor { get; set; }

		[Column("events.member-username-update")]
		public bool? EventsMemberUsernameUpdate { get; set; }
	}
}
