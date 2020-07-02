export interface RawGuildSettings {
	'id': string;
	'prefix': string;
	'language': string;
	'disableNaturalPrefix': boolean;
	'disabledCommands': string[];
	'commandUses': number;
	'custom-commands': Record<string, unknown>[];
	'permissions.users': Record<string, unknown>[];
	'permissions.roles': Record<string, unknown>[];
	'channels.announcements': string | null;
	'channels.greeting': string | null;
	'channels.farewell': string | null;
	'channels.member-logs': string | null;
	'channels.message-logs': string | null;
	'channels.moderation-logs': string | null;
	'channels.nsfw-message-logs': string | null;
	'channels.image-logs': string | null;
	'channels.prune-logs': string | null;
	'channels.reaction-logs': string | null;
	'channels.roles': string | null;
	'channels.spam': string | null;
	'command-autodelete': Record<string, unknown>[];
	'disabledChannels': string[];
	'disabledCommandsChannels': Record<string, unknown>[];
	'events.banAdd': boolean;
	'events.banRemove': boolean;
	'events.memberAdd': boolean;
	'events.memberRemove': boolean;
	'events.memberNameUpdate': boolean;
	'events.memberRoleUpdate': boolean;
	'events.messageDelete': boolean;
	'events.messageEdit': boolean;
	'events.twemoji-reactions': boolean;
	'messages.farewell': string | null;
	'messages.greeting': string | null;
	'messages.join-dm': string | null;
	'messages.ignoreChannels': string[];
	'messages.announcement-embed': boolean;
	'messages.moderation-dm': boolean;
	'messages.moderation-reason-display': boolean;
	'messages.moderation-message-display': boolean;
	'messages.moderation-auto-delete': boolean;
	'messages.moderator-name-display': boolean;
	'stickyRoles': Record<string, unknown>[];
	'roles.admin': string | null;
	'roles.auto': Record<string, unknown>[];
	'roles.initial': string | null;
	'roles.messageReaction': string | null;
	'roles.moderator': string | null;
	'roles.muted': string | null;
	'roles.restricted-reaction': string | null;
	'roles.restricted-embed': string | null;
	'roles.restricted-emoji': string | null;
	'roles.restricted-attachment': string | null;
	'roles.restricted-voice': string | null;
	'roles.public': string[];
	'roles.reactions': Record<string, unknown>[];
	'roles.removeInitial': boolean;
	'roles.dj': string | null;
	'roles.subscriber': string | null;
	'roles.uniqueRoleSets': Record<string, unknown>[];
	'selfmod.attachment': boolean;
	'selfmod.attachmentMaximum': number;
	'selfmod.attachmentDuration': number;
	'selfmod.attachmentAction': number;
	'selfmod.attachmentPunishmentDuration': number | null;
	'selfmod.capitals.enabled': boolean;
	'selfmod.capitals.ignoredRoles': string[];
	'selfmod.capitals.ignoredChannels': string[];
	'selfmod.capitals.minimum': number;
	'selfmod.capitals.maximum': number;
	'selfmod.capitals.softAction': number;
	'selfmod.capitals.hardAction': number;
	'selfmod.capitals.hardActionDuration': number | null;
	'selfmod.capitals.thresholdMaximum': number;
	'selfmod.capitals.thresholdDuration': number;
	'selfmod.links.whitelist': string[];
	'selfmod.links.enabled': boolean;
	'selfmod.links.ignoredRoles': string[];
	'selfmod.links.ignoredChannels': string[];
	'selfmod.links.softAction': number;
	'selfmod.links.hardAction': number;
	'selfmod.links.hardActionDuration': number | null;
	'selfmod.links.thresholdMaximum': number;
	'selfmod.links.thresholdDuration': number;
	'selfmod.messages.enabled': boolean;
	'selfmod.messages.ignoredRoles': string[];
	'selfmod.messages.ignoredChannels': string[];
	'selfmod.messages.maximum': number;
	'selfmod.messages.queue-size': number;
	'selfmod.messages.softAction': number;
	'selfmod.messages.hardAction': number;
	'selfmod.messages.hardActionDuration': number | null;
	'selfmod.messages.thresholdMaximum': number;
	'selfmod.messages.thresholdDuration': number;
	'selfmod.newlines.enabled': boolean;
	'selfmod.newlines.ignoredRoles': string[];
	'selfmod.newlines.ignoredChannels': string[];
	'selfmod.newlines.maximum': number;
	'selfmod.newlines.softAction': number;
	'selfmod.newlines.hardAction': number;
	'selfmod.newlines.hardActionDuration': number | null;
	'selfmod.newlines.thresholdMaximum': number;
	'selfmod.newlines.thresholdDuration': number;
	'selfmod.invites.enabled': boolean;
	'selfmod.invites.ignoredCodes': string[];
	'selfmod.invites.ignoredGuilds': string[];
	'selfmod.invites.ignoredRoles': string[];
	'selfmod.invites.ignoredChannels': string[];
	'selfmod.invites.softAction': number;
	'selfmod.invites.hardAction': number;
	'selfmod.invites.hardActionDuration': number | null;
	'selfmod.invites.thresholdMaximum': number;
	'selfmod.invites.thresholdDuration': number;
	'selfmod.filter.enabled': boolean;
	'selfmod.filter.ignoredRoles': string[];
	'selfmod.filter.ignoredChannels': string[];
	'selfmod.filter.softAction': number;
	'selfmod.filter.hardAction': number;
	'selfmod.filter.hardActionDuration': number | null;
	'selfmod.filter.thresholdMaximum': number;
	'selfmod.filter.thresholdDuration': number;
	'selfmod.filter.raw': string[];
	'selfmod.reactions.enabled': boolean;
	'selfmod.reactions.ignoredRoles': string[];
	'selfmod.reactions.ignoredChannels': string[];
	'selfmod.reactions.maximum': number;
	'selfmod.reactions.whitelist': string[];
	'selfmod.reactions.blacklist': string[];
	'selfmod.reactions.softAction': number;
	'selfmod.reactions.hardAction': number;
	'selfmod.reactions.hardActionDuration': number | null;
	'selfmod.reactions.thresholdMaximum': number;
	'selfmod.reactions.thresholdDuration': number;
	'selfmod.raid': boolean;
	'selfmod.raidthreshold': number;
	'selfmod.ignoreChannels': string[];
	'no-mention-spam.enabled': boolean;
	'no-mention-spam.alerts': boolean;
	'no-mention-spam.mentionsAllowed': number;
	'no-mention-spam.timePeriod': number;
	'social.enabled': boolean;
	'social.achieve': boolean;
	'social.achieveMessage': string | null;
	'social.multiplier': number;
	'social.ignoreChannels': string[];
	'starboard.channel': string | null;
	'starboard.emoji': string;
	'starboard.ignoreChannels': string[];
	'starboard.minimum': number;
	'trigger.alias': Record<string, unknown>[];
	'trigger.includes': Record<string, unknown>[];
	'music.default-volume': number;
	'music.maximum-duration': number;
	'music.maximum-entries-per-user': number;
	'music.allow-streams': boolean;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS guild (
		"id"                                   VARCHAR(19)                              NOT NULL,
		"prefix"                               VARCHAR(10)    DEFAULT 's!'               NOT NULL,
		"language"                             VARCHAR(5)     DEFAULT 'en-US'            NOT NULL,
		"disableNaturalPrefix"                 BOOLEAN        DEFAULT FALSE              NOT NULL,
		"disabledCommands"                     VARCHAR(32)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"commandUses"                          INTEGER        DEFAULT 0                  NOT NULL,
		"custom-commands"                      JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"permissions.users"                    JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"permissions.roles"                    JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"channels.announcements"               VARCHAR(19),
		"channels.greeting"                    VARCHAR(19),
		"channels.farewell"                    VARCHAR(19),
		"channels.member-logs"                 VARCHAR(19),
		"channels.message-logs"                VARCHAR(19),
		"channels.moderation-logs"             VARCHAR(19),
		"channels.nsfw-message-logs"           VARCHAR(19),
		"channels.image-logs"                  VARCHAR(19),
		"channels.prune-logs"                  VARCHAR(19),
		"channels.reaction-logs"               VARCHAR(19),
		"channels.roles"                       VARCHAR(19),
		"channels.spam"                        VARCHAR(19),
		"command-autodelete"                   JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"disabledChannels"                     VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"disabledCommandsChannels"             JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"events.banAdd"                        BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.banRemove"                     BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.memberAdd"                     BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.memberRemove"                  BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.memberNameUpdate"              BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.memberRoleUpdate"              BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.messageDelete"                 BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.messageEdit"                   BOOLEAN        DEFAULT FALSE              NOT NULL,
		"events.twemoji-reactions"             BOOLEAN        DEFAULT FALSE              NOT NULL,
		"messages.farewell"                    VARCHAR(2000),
		"messages.greeting"                    VARCHAR(2000),
		"messages.join-dm"                     VARCHAR(1500),
		"messages.ignoreChannels"              VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"messages.announcement-embed"          BOOLEAN        DEFAULT FALSE              NOT NULL,
		"messages.moderation-dm"               BOOLEAN        DEFAULT FALSE              NOT NULL,
		"messages.moderation-reason-display"   BOOLEAN        DEFAULT TRUE               NOT NULL,
		"messages.moderation-message-display"  BOOLEAN        DEFAULT TRUE               NOT NULL,
		"messages.moderation-auto-delete"      BOOLEAN        DEFAULT FALSE              NOT NULL,
		"messages.moderator-name-display"      BOOLEAN        DEFAULT TRUE               NOT NULL,
		"stickyRoles"                          JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.admin"                          VARCHAR(19),
		"roles.auto"                           JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.initial"                        VARCHAR(19),
		"roles.messageReaction"                VARCHAR(19),
		"roles.moderator"                      VARCHAR(19),
		"roles.muted"                          VARCHAR(19),
		"roles.restricted-reaction"            VARCHAR(19),
		"roles.restricted-embed"               VARCHAR(19),
		"roles.restricted-emoji"               VARCHAR(19),
		"roles.restricted-attachment"          VARCHAR(19),
		"roles.restricted-voice"               VARCHAR(19),
		"roles.public"                         VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"roles.reactions"                      JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.removeInitial"                  BOOLEAN        DEFAULT FALSE              NOT NULL,
		"roles.dj"                             VARCHAR(19),
		"roles.subscriber"                     VARCHAR(19),
		"roles.uniqueRoleSets"                 JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"selfmod.attachment"                   BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.attachmentMaximum"            SMALLINT       DEFAULT 20                 NOT NULL,
		"selfmod.attachmentDuration"           SMALLINT       DEFAULT 20000              NOT NULL,
		"selfmod.attachmentAction"             SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.attachmentPunishmentDuration" INTEGER,
		"selfmod.capitals.enabled"             BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.capitals.ignoredRoles"        VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.capitals.ignoredChannels"     VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.capitals.minimum"             SMALLINT       DEFAULT 15                 NOT NULL,
		"selfmod.capitals.maximum"             SMALLINT       DEFAULT 50                 NOT NULL,
		"selfmod.capitals.softAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.capitals.hardAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.capitals.hardActionDuration"  INTEGER,
		"selfmod.capitals.thresholdMaximum"    SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.capitals.thresholdDuration"   INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.links.whitelist"              VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.links.enabled"                BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.links.ignoredRoles"           VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.links.ignoredChannels"        VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.links.softAction"             SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.links.hardAction"             SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.links.hardActionDuration"     INTEGER,
		"selfmod.links.thresholdMaximum"       SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.links.thresholdDuration"      INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.messages.enabled"             BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.messages.ignoredRoles"        VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.messages.ignoredChannels"     VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.messages.maximum"             SMALLINT       DEFAULT 5                  NOT NULL,
		"selfmod.messages.queue-size"          SMALLINT       DEFAULT 50                 NOT NULL,
		"selfmod.messages.softAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.messages.hardAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.messages.hardActionDuration"  INTEGER,
		"selfmod.messages.thresholdMaximum"    SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.messages.thresholdDuration"   INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.newlines.enabled"             BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.newlines.ignoredRoles"        VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.newlines.ignoredChannels"     VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.newlines.maximum"             SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.newlines.softAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.newlines.hardAction"          SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.newlines.hardActionDuration"  INTEGER,
		"selfmod.newlines.thresholdMaximum"    SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.newlines.thresholdDuration"   INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.invites.enabled"              BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.invites.ignoredCodes"         VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.invites.ignoredGuilds"        VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.invites.ignoredRoles"         VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.invites.ignoredChannels"      VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.invites.softAction"           SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.invites.hardAction"           SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.invites.hardActionDuration"   INTEGER,
		"selfmod.invites.thresholdMaximum"     SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.invites.thresholdDuration"    INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.filter.enabled"               BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.filter.ignoredRoles"          VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.filter.ignoredChannels"       VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.filter.softAction"            SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.filter.hardAction"            SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.filter.hardActionDuration"    INTEGER,
		"selfmod.filter.thresholdMaximum"      SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.filter.thresholdDuration"     INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.filter.raw"                   VARCHAR(32)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.reactions.enabled"            BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.reactions.ignoredRoles"       VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.reactions.ignoredChannels"    VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.reactions.maximum"            SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.reactions.whitelist"          VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.reactions.blacklist"          VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.reactions.softAction"         SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.reactions.hardAction"         SMALLINT       DEFAULT 0                  NOT NULL,
		"selfmod.reactions.hardActionDuration" INTEGER,
		"selfmod.reactions.thresholdMaximum"   SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.reactions.thresholdDuration"  INTEGER        DEFAULT 60000              NOT NULL,
		"selfmod.raid"                         BOOLEAN        DEFAULT FALSE              NOT NULL,
		"selfmod.raidthreshold"                SMALLINT       DEFAULT 10                 NOT NULL,
		"selfmod.ignoreChannels"               VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"no-mention-spam.enabled"              BOOLEAN        DEFAULT FALSE              NOT NULL,
		"no-mention-spam.alerts"               BOOLEAN        DEFAULT FALSE              NOT NULL,
		"no-mention-spam.mentionsAllowed"      SMALLINT       DEFAULT 20                 NOT NULL,
		"no-mention-spam.timePeriod"           INTEGER        DEFAULT 8                  NOT NULL,
		"social.enabled"                       BOOLEAN        DEFAULT TRUE               NOT NULL,
		"social.achieve"                       BOOLEAN        DEFAULT FALSE              NOT NULL,
		"social.achieveMessage"                VARCHAR(2000),
		"social.multiplier"                    FLOAT          DEFAULT 1                  NOT NULL,
		"social.ignoreChannels"                VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"starboard.channel"                    VARCHAR(19),
		"starboard.emoji"                      VARCHAR(75)    DEFAULT '%E2%AD%90'        NOT NULL,
		"starboard.ignoreChannels"             VARCHAR(19)[]  DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"starboard.minimum"                    SMALLINT       DEFAULT 1                  NOT NULL,
		"trigger.alias"                        JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"trigger.includes"                     JSON[]         DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"music.default-volume"                 SMALLINT       DEFAULT 100                NOT NULL,
		"music.maximum-duration"               INTEGER        DEFAULT 7200000            NOT NULL,
		"music.maximum-entries-per-user"       SMALLINT       DEFAULT 100                NOT NULL,
		"music.allow-streams"                  BOOLEAN        DEFAULT TRUE               NOT NULL,
		PRIMARY KEY("id"),
		CHECK("prefix" <> ''),
		CHECK("selfmod.attachmentMaximum" >= 0 AND "selfmod.attachmentMaximum" <= 60),
		CHECK("selfmod.attachmentDuration" >= 5000 AND "selfmod.attachmentDuration" <= 120000),
		CHECK("selfmod.attachmentPunishmentDuration" >= 1000),
		CHECK("selfmod.capitals.minimum" >= 5 AND "selfmod.capitals.minimum" <= 2000),
		CHECK("selfmod.capitals.maximum" >= 10 AND "selfmod.capitals.maximum" <= 100),
		CHECK("selfmod.capitals.hardActionDuration" >= 1000),
		CHECK("selfmod.capitals.thresholdMaximum" >= 0 AND "selfmod.capitals.thresholdMaximum" <= 120000),
		CHECK("selfmod.capitals.thresholdDuration" >= 1000),
		CHECK("selfmod.links.hardActionDuration" >= 1000),
		CHECK("selfmod.links.thresholdMaximum" >= 0 AND "selfmod.links.thresholdMaximum" <= 60),
		CHECK("selfmod.links.thresholdDuration" >= 0 AND "selfmod.links.thresholdDuration" <= 120000),
		CHECK("selfmod.messages.maximum" >= 2 AND "selfmod.messages.maximum" <= 100),
		CHECK("selfmod.messages.queue-size" >= 10 AND "selfmod.messages.queue-size" <= 100),
		CHECK("selfmod.messages.hardActionDuration" >= 1000),
		CHECK("selfmod.messages.thresholdMaximum" >= 0 AND "selfmod.messages.thresholdMaximum" <= 120000),
		CHECK("selfmod.messages.thresholdDuration" >= 1000),
		CHECK("selfmod.newlines.maximum" >= 10 AND "selfmod.newlines.maximum" <= 2000),
		CHECK("selfmod.newlines.hardActionDuration" >= 1000),
		CHECK("selfmod.newlines.thresholdMaximum" >= 0 AND "selfmod.newlines.thresholdMaximum" <= 60),
		CHECK("selfmod.newlines.thresholdDuration" >= 0 AND "selfmod.newlines.thresholdDuration" <= 120000),
		CHECK("selfmod.invites.hardActionDuration" >= 1000),
		CHECK("selfmod.invites.thresholdMaximum" >= 0 AND "selfmod.invites.thresholdMaximum" <= 60),
		CHECK("selfmod.invites.thresholdDuration" >= 0 AND "selfmod.invites.thresholdDuration" <= 120000),
		CHECK("selfmod.filter.hardActionDuration" >= 1000),
		CHECK("selfmod.filter.thresholdMaximum" >= 0 AND "selfmod.filter.thresholdMaximum" <= 60),
		CHECK("selfmod.filter.thresholdDuration" >= 0 AND "selfmod.filter.thresholdDuration" <= 120000),
		CHECK("selfmod.reactions.maximum" >= 1 AND "selfmod.reactions.maximum" <= 100),
		CHECK("selfmod.reactions.hardActionDuration" >= 1000),
		CHECK("selfmod.reactions.thresholdMaximum" >= 0 AND "selfmod.reactions.thresholdMaximum" <= 60),
		CHECK("selfmod.reactions.thresholdDuration" >= 0 AND "selfmod.reactions.thresholdDuration" <= 120000),
		CHECK("selfmod.raidthreshold" >= 2 AND "selfmod.raidthreshold" <= 50),
		CHECK("no-mention-spam.mentionsAllowed" >= 0),
		CHECK("no-mention-spam.timePeriod" >= 0),
		CHECK("social.multiplier" >= 0 AND "social.multiplier" <= 5),
		CHECK("starboard.minimum" >= 1),
		CHECK("music.default-volume" >= 0 AND "music.default-volume" <= 200),
		CHECK("music.maximum-duration" >= 0 AND "music.maximum-duration" <= 43200000),
		CHECK("music.maximum-entries-per-user" >= 1 AND "music.maximum-entries-per-user" <= 250)
	);
`;
