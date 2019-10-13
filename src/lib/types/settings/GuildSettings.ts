import { SelfModeratorHardActionFlags } from '../../structures/SelfModeratorBitField';
import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {

	export const CommandUses = T<number>('commandUses');
	export const Prefix = T<string>('prefix');
	export const Tags = T<readonly [string, string][]>('tags');

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
		export const Roles = T<string>('channels.roles');
		export const Spam = T<string>('channels.spam');
	}

	export const CommandAutodelete = T<readonly [string, number][]>('command-autodelete');
	export const DisabledChannels = T<readonly string[]>('disabledChannels');
	export const DisabledCommandChannels = T<readonly DisabledCommandChannel[]>('disabledCommandsChannels');

	export namespace Events {
		export const BanAdd = T<boolean>('events.banAdd');
		export const BanRemove = T<boolean>('events.banRemove');
		export const MemberAdd = T<boolean>('events.memberAdd');
		export const MemberRemove = T<boolean>('events.memberRemove');
		export const MessageDelete = T<boolean>('events.messageDelete');
		export const MessageEdit = T<boolean>('events.messageEdit');
	}

	export namespace Messages {
		export const Farewell = T<string>('messages.farewell');
		export const Greeting = T<string>('messages.greeting');
		export const JoinDM = T<string>('messages.join-dm');
		export const Warnings = T<boolean>('messages.warnings');
		export const IgnoreChannels = T<readonly string[]>('messages.ignoreChannels');
	}

	export const StickyRoles = T<readonly StickyRole[]>('stickyRoles');

	export namespace Roles {
		export const Admin = T<string>('roles.admin');
		export const Auto = T<readonly RolesAuto[]>('roles.auto');
		export const Initial = T<string>('roles.initial');
		export const MessageReaction = T<string>('roles.messageReaction');
		export const Moderator = T<string>('roles.moderator');
		export const Muted = T<string>('roles.muted');
		export const Public = T<readonly string[]>('roles.public');
		export const Reactions = T<readonly RolesReaction[]>('roles.reactions');
		export const RemoveInitial = T<boolean>('roles.removeInitial');
		export const Staff = T<string>('roles.staff');
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
			export const Minimum = T<number>('selfmod.capitals.minimum');
			export const Maximum = T<number>('selfmod.capitals.maximum');
			export const SoftAction = T<number>('selfmod.capitals.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.capitals.hardAction');
			export const HardActionDuration = T<number>('selfmod.capitals.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.capitals.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.capitals.thresholdDuration');
		}

		export namespace NewLines {
			export const Enabled = T<boolean>('selfmod.newlines.enabled');
			export const Maximum = T<number>('selfmod.newlines.maximum');
			export const SoftAction = T<number>('selfmod.newlines.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.newlines.hardAction');
			export const HardActionDuration = T<number>('selfmod.newlines.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.newlines.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.newlines.thresholdDuration');
		}

		export namespace Invites {
			export const Enabled = T<boolean>('selfmod.invites.enabled');
			export const SoftAction = T<number>('selfmod.invites.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.invites.hardAction');
			export const HardActionDuration = T<number>('selfmod.invites.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.invites.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.invites.thresholdDuration');
		}

		export namespace Filter {
			export const Raw = T<readonly string[]>('selfmod.filter.raw');
			export const Enabled = T<boolean>('selfmod.filter.enabled');
			export const SoftAction = T<number>('selfmod.filter.softAction');
			export const HardAction = T<SelfModeratorHardActionFlags>('selfmod.filter.hardAction');
			export const HardActionDuration = T<number>('selfmod.filter.hardActionDuration');
			export const ThresholdMaximum = T<number>('selfmod.filter.thresholdMaximum');
			export const ThresholdDuration = T<number | null>('selfmod.filter.thresholdDuration');
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
		export const Achieve = T<boolean>('social.achieve');
		export const AchieveMessage = T<string>('social.achieveMessage');
		export const IgnoreChannels = T<readonly string[]>('social.ignoreChannels');
	}

	export namespace Starboard {
		export const Channel = T<string>('starboard.channel');
		export const Emoji = T<string>('starboard.emoji');
		export const IgnoreChannels = T<string>('starboard.ignoreChannels');
		export const Minimum = T<number>('starboard.minimum');
	}

	export namespace Trigger {
		export const Alias = T<readonly TriggerAlias[]>('trigger.alias');
		export const Includes = T<readonly TriggerIncludes[]>('trigger.includes');
	}

}

export interface PermissionsNode {
	id: string;
	allow: string[];
	deny: string[];
}

export interface DisabledCommandChannel {
	channel: string;
	commands: readonly string[];
}

export interface StickyRole {
	user: string;
	roles: readonly string[];
}

export interface RolesAuto {
	id: string;
	points: number;
}

export interface RolesReaction {
	emoji: string;
	role: string;
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
