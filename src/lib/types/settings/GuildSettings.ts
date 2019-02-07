// tslint:disable:no-shadowed-variable
// TSLint gives false errors
export namespace GuildSettings {

	export type Prefix = string;
	export type Tags = Array<[string, string]>;

	export namespace Channels {
		export type Announcements = string;
		export type Greeting = string;
		export type Farewell = string;
		export type MemberLogs = string;
		export type MessageLogs = string;
		export type ModerationLogs = string;
		export type NSFWMessageLogs = string;
		export type Roles = string;
		export type Spam = string;
	}

	export type DisabledChannels = Array<string>;
	export type DisabledCommandChannels = Array<DisabledCommandChannel>;

	export namespace Events {
		export type BanAdd = boolean;
		export type BanRemove = boolean;
		export type MemberAdd = boolean;
		export type MemberRemove = boolean;
		export type MessageDelete = boolean;
		export type MessageEdit = boolean;
	}

	export namespace Filter {
		export type Level = number;
		export type Raw = Array<string>;
	}

	export namespace Messages {
		export type Farewell = string;
		export type Greeting = string;
		export type JoinDM = string;
		export type Warnings = boolean;
	}

	export type StickyRoles = Array<StickyRole>;

	export namespace Roles {
		export type Admin = string;
		export type Auto = Array<RolesAuto>;
		export type Initial = string;
		export type MessageReaction = string;
		export type Moderator = string;
		export type Muted = string;
		export type Public = string[];
		export type Reactions = Array<RolesReaction>;
		export type RemoveInitial = boolean;
		export type Staff = string;
		export type Subscriber = string;
	}

	export namespace Selfmod {
		export type Attachment = boolean;
		export type AttachmentAction = number;
		export type AttachmentDuration = number;
		export type AttachmentMaximum = number;
		export type AttachmentPunishmentDuration = number;
		export type Capsfilter = number;
		export type Capsminimum = number;
		export type Capsthreshold = number;
		export type IgnoreChannels = Array<string>;
		export type Invitelinks = boolean;
		export type Raid = string;
		export type Raidthreshold = number;
	}

	export namespace NoMentionSpam {
		export type Alerts = boolean;
		export type Enabled = boolean;
		export type MentionsAllowed = number;
		export type TimePeriod = number;
	}

	export namespace Social {
		export type Achieve = boolean;
		export type AchieveMessage = string;
		export type IgnoreChannels = Array<string>;
	}

	export namespace Starboard {
		export type Channel = string;
		export type Emoji = string;
		export type IgnoreChannels = string;
		export type Minimum = number;
	}

	export namespace Trigger {
		export type Alias = Array<TriggerAlias>;
		export type Includes = Array<TriggerIncludes>;
	}

}

export namespace GuildSettings {

	export const Prefix = 'prefix';
	export const Tags = 'tags';

	export namespace Channels {
		export const Announcements = 'channels.announcements';
		export const Greeting = 'channels.greeting';
		export const Farewell = 'channels.farewell';
		export const MemberLogs = 'channels.member-logs';
		export const MessageLogs = 'channels.message-logs';
		export const ModerationLogs = 'channels.moderation-logs';
		export const NSFWMessageLogs = 'channels.nsfw-message-logs';
		export const Roles = 'channels.roles';
		export const Spam = 'channels.spam';
	}

	export const DisabledChannels = 'disabledChannels';
	export const DisabledCommandChannels = 'disabledCommandsChannels';

	export namespace Events {
		export const BanAdd = 'events.banAdd';
		export const BanRemove = 'events.banRemove';
		export const MemberAdd = 'events.memberAdd';
		export const MemberRemove = 'events.memberRemove';
		export const MessageDelete = 'events.messageDelete';
		export const MessageEdit = 'events.messageEdit';
	}

	export namespace Filter {
		export const Level = 'filter.level';
		export const Raw = 'filter.raw';
	}

	export namespace Messages {
		export const Farewell = 'messages.farewell';
		export const Greeting = 'messages.greeting';
		export const JoinDM = 'messages.join-dm';
		export const Warnings = 'messages.warnings';
	}

	export const StickyRoles = 'stickyRoles';

	export namespace Roles {
		export const Admin = 'roles.admin';
		export const Auto = 'roles.auto';
		export const Initial = 'roles.initial';
		export const MessageReaction = 'roles.messageReaction';
		export const Moderator = 'roles.moderator';
		export const Muted = 'roles.muted';
		export const Public = 'roles.public';
		export const Reactions = 'roles.reactions';
		export const RemoveInitial = 'roles.removeInitial';
		export const Staff = 'roles.staff';
		export const Subscriber = 'roles.subscriber';
	}

	export namespace Selfmod {
		export const Attachment = 'selfmod.attachment';
		export const AttachmentAction = 'selfmod.attachmentAction';
		export const AttachmentDuration = 'selfmod.attachmentDuration';
		export const AttachmentMaximum = 'selfmod.attachmentMaximum';
		export const AttachmentPunishmentDuration = 'selfmod.attachmentPunishmentDuration';
		export const Capsfilter = 'selfmod.capsfilter';
		export const Capsminimum = 'selfmod.capsminimum';
		export const Capsthreshold = 'selfmod.capsthreshold';
		export const IgnoreChannels = 'selfmod.ignoreChannels';
		export const Invitelinks = 'selfmod.invitelinks';
		export const Raid = 'selfmod.raid';
		export const Raidthreshold = 'selfmod.raidthreshold';
	}

	export namespace NoMentionSpam {
		export const Alerts = 'no-mention-spam.alerts';
		export const Enabled = 'no-mention-spam.enabled';
		export const MentionsAllowed = 'no-mention-spam.mentionsAllowed';
		export const TimePeriod = 'no-mention-spam.timePeriod';
	}

	export namespace Social {
		export const Achieve = 'social.achieve';
		export const AchieveMessage = 'social.achieveMessage';
		export const IgnoreChannels = 'social.ignoreChannels';
	}

	export namespace Starboard {
		export const Channel = 'starboard.channel';
		export const Emoji = 'starboard.emoji';
		export const IgnoreChannels = 'starboard.ignoreChannels';
		export const Minimum = 'starboard.minimum';
	}

	export namespace Trigger {
		export const Alias = 'trigger.alias';
		export const Includes = 'trigger.includes';
	}

}

interface DisabledCommandChannel {
	channel: string;
	commands: string[];
}

export interface StickyRole {
	user: string;
	roles: string[];
}

export interface RolesAuto {
	id: string;
	points: number;
}

interface RolesReaction {
	emoji: string;
	role: string;
}

interface TriggerAlias {
	input: string;
	output: string;
}

interface TriggerIncludes {
	action: 'react';
	input: string;
	output: string;
}
