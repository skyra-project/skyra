import { SelfModeratorHardActionFlags } from '@lib/structures/SelfModeratorBitField';
import { T } from '../Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const CommandUses = T<number>('commandUses');
	export const Prefix = T<string>('prefix');
	export const CustomCommands = T<CustomCommand[]>('custom-commands');

	export namespace Permissions {
		export const Users = T<readonly PermissionsNode[]>('permissions.users');
		export const Roles = T<readonly PermissionsNode[]>('permissions.roles');
	}

	export namespace Channels {
		export const Announcements = T<string>('channels.announcements');
		export const Greeting = T<string>('channels.greeting');
		export const Farewell = T<string>('channels.farewell');
		export const MemberLogs = T<string>('channels.member-logs');
		export const MessageLogs = T<string>('channels.message-logs');
		export const ModerationLogs = T<string>('channels.moderation-logs');
		export const NSFWMessageLogs = T<string>('channels.nsfw-message-logs');
		export const ImageLogs = T<string>('channels.image-logs');
		export const PruneLogs = T<string>('channels.prune-logs');
		export const ReactionLogs = T<string>('channels.reaction-logs');
		export const Spam = T<string>('channels.spam');
		export namespace Ignore {
			export const MessageDelete = T<string[]>('channels.ignore.message-delete');
			export const MessageEdit = T<string[]>('channels.ignore.message-edit');
			export const ReactionAdd = T<string[]>('channels.ignore.reaction-add');
			export const All = T<string[]>('channels.ignore.all');
		}
	}

	export const CommandAutodelete = T<readonly [string, number][]>('command-autodelete');
	export const DisabledChannels = T<readonly string[]>('disabledChannels');
	export const DisabledCommandChannels = T<readonly DisabledCommandChannel[]>('disabledCommandsChannels');

	export namespace Events {
		export const BanAdd = T<boolean>('events.banAdd');
		export const BanRemove = T<boolean>('events.banRemove');
		export const MemberAdd = T<boolean>('events.memberAdd');
		export const MemberRemove = T<boolean>('events.memberRemove');
		export const MemberNicknameUpdate = T<boolean>('events.memberNameUpdate');
		export const MemberRoleUpdate = T<boolean>('events.memberRoleUpdate');
		export const MessageDelete = T<boolean>('events.messageDelete');
		export const MessageEdit = T<boolean>('events.messageEdit');
		export const Twemoji = T<number>('events.twemoji-reactions');
	}

	export namespace Messages {
		export const Farewell = T<string>('messages.farewell');
		export const Greeting = T<string>('messages.greeting');
		export const JoinDM = T<string>('messages.join-dm');
		export const IgnoreChannels = T<readonly string[]>('messages.ignoreChannels');
		export const AnnouncementEmbed = T<boolean>('messages.announcement-embed');
		export const ModerationDM = T<boolean>('messages.moderation-dm');
		export const ModerationReasonDisplay = T<boolean>('messages.moderation-reason-display');
		export const ModerationMessageDisplay = T<boolean>('messages.moderation-message-display');
		export const ModerationAutoDelete = T<boolean>('messages.moderation-auto-delete');
		export const ModeratorNameDisplay = T<boolean>('messages.moderator-name-display');
	}

	export const StickyRoles = T<readonly StickyRole[]>('stickyRoles');
	export const ReactionRoles = T<readonly ReactionRole[]>('reaction-roles');

	export namespace Roles {
		export const Admin = T<string>('roles.admin');
		export const Auto = T<readonly RolesAuto[]>('roles.auto');
		export const Initial = T<string>('roles.initial');
		export const Moderator = T<string>('roles.moderator');
		export const Muted = T<string>('roles.muted');
		export const RestrictedReaction = T<string>('roles.restricted-reaction');
		export const RestrictedEmbed = T<string>('roles.restricted-embed');
		export const RestrictedEmoji = T<string>('roles.restricted-emoji');
		export const RestrictedAttachment = T<string>('roles.restricted-attachment');
		export const RestrictedVoice = T<string>('roles.restricted-voice');
		export const Public = T<readonly string[]>('roles.public');
		export const RemoveInitial = T<boolean>('roles.removeInitial');
		export const Dj = T<string>('roles.dj');
		export const Subscriber = T<string>('roles.subscriber');
		export const UniqueRoleSets = T<readonly UniqueRoleSet[]>('roles.uniqueRoleSets');
	}

	export namespace Selfmod {
		export const Attachment = T<boolean>('selfmod.attachment');
		export const AttachmentAction = T<number>('selfmod.attachmentAction');
		export const AttachmentDuration = T<number>('selfmod.attachmentDuration');
		export const AttachmentMaximum = T<number>('selfmod.attachmentMaximum');
		export const AttachmentPunishmentDuration = T<number>('selfmod.attachmentPunishmentDuration');

		export namespace Capitals {
			export const Enabled = T<boolean>('selfmod.capitals.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.capitals.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.capitals.ignoredChannels');
			export const Minimum = T<number>('selfmod.capitals.minimum');
			export const Maximum = T<number>('selfmod.capitals.maximum');
			export const SoftAction = T<number>('selfmod.capitals.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.capitals.hardAction');
			export const HardActionDuration = T<number>('selfmod.capitals.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.capitals.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.capitals.thresholdDuration');
		}

		export namespace Links {
			export const Whitelist = T<readonly string[]>('selfmod.links.whitelist');
			export const Enabled = T<boolean>('selfmod.links.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.links.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.links.ignoredChannels');
			export const SoftAction = T<number>('selfmod.links.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.links.hardAction');
			export const HardActionDuration = T<number>('selfmod.links.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.links.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.links.thresholdDuration');
		}

		export namespace Messages {
			export const Enabled = T<boolean>('selfmod.messages.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.messages.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.messages.ignoredChannels');
			export const Maximum = T<number>('selfmod.messages.maximum');
			export const QueueSize = T<number>('selfmod.messages.queue-size');
			export const SoftAction = T<number>('selfmod.messages.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.messages.hardAction');
			export const HardActionDuration = T<number>('selfmod.messages.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.messages.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.messages.thresholdDuration');
		}

		export namespace NewLines {
			export const Enabled = T<boolean>('selfmod.newlines.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.newlines.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.newlines.ignoredChannels');
			export const Maximum = T<number>('selfmod.newlines.maximum');
			export const SoftAction = T<number>('selfmod.newlines.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.newlines.hardAction');
			export const HardActionDuration = T<number>('selfmod.newlines.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.newlines.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.newlines.thresholdDuration');
		}

		export namespace Invites {
			export const Enabled = T<boolean>('selfmod.invites.enabled');
			export const IgnoredCodes = T<string[]>('selfmod.invites.ignoredCodes');
			export const IgnoredGuilds = T<string[]>('selfmod.invites.ignoredGuilds');
			export const IgnoredRoles = T<string[]>('selfmod.invites.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.invites.ignoredChannels');
			export const SoftAction = T<number>('selfmod.invites.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.invites.hardAction');
			export const HardActionDuration = T<number>('selfmod.invites.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.invites.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.invites.thresholdDuration');
		}

		export namespace Filter {
			export const Raw = T<readonly string[]>('selfmod.filter.raw');
			export const Enabled = T<boolean>('selfmod.filter.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.filter.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.filter.ignoredChannels');
			export const SoftAction = T<number>('selfmod.filter.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.filter.hardAction');
			export const HardActionDuration = T<number>('selfmod.filter.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.filter.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.filter.thresholdDuration');
		}

		export namespace Reactions {
			export const Enabled = T<boolean>('selfmod.reactions.enabled');
			export const IgnoredRoles = T<string[]>('selfmod.reactions.ignoredRoles');
			export const IgnoredChannels = T<string[]>('selfmod.reactions.ignoredChannels');
			export const Maximum = T<number>('selfmod.reactions.maximum');
			export const WhiteList = T<string[]>('selfmod.reactions.whitelist');
			export const BlackList = T<string[]>('selfmod.reactions.blacklist');
			export const SoftAction = T<number>('selfmod.reactions.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.reactions.hardAction');
			export const HardActionDuration = T<number>('selfmod.reactions.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.reactions.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.reactions.thresholdDuration');
		}

		export const IgnoreChannels = T<readonly string[]>('selfmod.ignoreChannels');
		export const Raid = T<string>('selfmod.raid');
		export const Raidthreshold = T<number>('selfmod.raidthreshold');
	}

	export namespace NoMentionSpam {
		export const Alerts = T<boolean>('no-mention-spam.alerts');
		export const Enabled = T<boolean>('no-mention-spam.enabled');
		export const MentionsAllowed = T<number>('no-mention-spam.mentionsAllowed');
		export const TimePeriod = T<number>('no-mention-spam.timePeriod');
	}

	export namespace Social {
		export const Enabled = T<boolean>('social.enabled');
		export const Achieve = T<boolean>('social.achieve');
		export const AchieveMessage = T<string>('social.achieveMessage');
		export const Multiplier = T<number>('social.multiplier');
		export const IgnoreChannels = T<readonly string[]>('social.ignoreChannels');
	}

	export namespace Starboard {
		export const Channel = T<string>('starboard.channel');
		export const Emoji = T<string>('starboard.emoji');
		export const IgnoreChannels = T<string>('starboard.ignoreChannels');
		export const Minimum = T<number>('starboard.minimum');
		export const SelfStar = T<boolean>('starboard.selfStar');
	}

	export namespace Trigger {
		export const Alias = T<readonly TriggerAlias[]>('trigger.alias');
		export const Includes = T<readonly TriggerIncludes[]>('trigger.includes');
	}

	export namespace Notifications {
		export namespace Streams {
			export namespace Twitch {
				export const Streamers = T<readonly NotificationsStreamTwitch[]>('notifications.streams.twitch.streamers');
			}
		}
	}

	export namespace Music {
		export const DefaultVolume = T<number>('music.default-volume');
		export const MaximumDuration = T<number>('music.maximum-duration');
		export const MaximumEntriesPerUser = T<number>('music.maximum-entries-per-user');
		export const AllowStreams = T<boolean>('music.allow-streams');
	}

	export namespace Suggestions {
		export const AscendingID = T<number>('suggestions.id');
		export const SuggestionsChannel = T<string | null>('suggestions.channel');
		export namespace VotingEmojis {
			export const UpvoteEmoji = T<string>('suggestions.emojis.upvote');
			export const DownvoteEmoji = T<string>('suggestions.emojis.downvote');
		}
		export namespace OnAction {
			export const DM = T<boolean>('suggestions.on-action.dm');
			export const RepostMessage = T<boolean>('suggestions.on-action.repost');
			export const HideAuthor = T<boolean>('suggestions.on-action.hide-author');
		}
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
	content: string;
	args: string[];
}

export interface DisabledCommandChannel {
	channel: string;
	commands: readonly string[];
}

export interface StickyRole {
	user: string;
	roles: readonly string[];
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

export interface TriggerIncludes {
	action: 'react';
	input: string;
	output: string;
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
	embed: boolean;
	status: NotificationsStreamsTwitchEventStatus;
	gamesBlacklist: readonly string[];
	gamesWhitelist: readonly string[];
	createdAt: number;
}

export type NotificationsStreamTwitch = [string, readonly NotificationsStreamsTwitchStreamer[]];
