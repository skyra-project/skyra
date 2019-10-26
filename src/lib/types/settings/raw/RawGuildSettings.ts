export interface RawGuildSettings {
	'id': string;
	'prefix': string;
	'language': string;
	'disableNaturalPrefix': boolean;
	'disabledCommands': string[];
	'commandUses': number;
	'tags': object[];
	'permissions.users': object[];
	'permissions.roles': object[];
	'channels.announcements': string | null;
	'channels.greeting': string | null;
	'channels.farewell': string | null;
	'channels.member-logs': string | null;
	'channels.message-logs': string | null;
	'channels.moderation-logs': string | null;
	'channels.nsfw-message-logs': string | null;
	'channels.image-logs': string | null;
	'channels.roles': string | null;
	'channels.spam': string | null;
	'command-autodelete': object[];
	'disabledChannels': string[];
	'disabledCommandsChannels': object[];
	'events.banAdd': boolean;
	'events.banRemove': boolean;
	'events.memberAdd': boolean;
	'events.memberRemove': boolean;
	'events.messageDelete': boolean;
	'events.messageEdit': boolean;
	'messages.farewell': string | null;
	'messages.greeting': string | null;
	'messages.join-dm': string | null;
	'messages.ignoreChannels': string[];
	'messages.moderation-dm': boolean;
	'messages.moderator-name-display': boolean;
	'stickyRoles': object[];
	'roles.admin': string | null;
	'roles.auto': object[];
	'roles.initial': string | null;
	'roles.messageReaction': string | null;
	'roles.moderator': string | null;
	'roles.muted': string | null;
	'roles.public': string[];
	'roles.reactions': object[];
	'roles.removeInitial': boolean;
	'roles.staff': string | null;
	'roles.dj': string | null;
	'roles.subscriber': string | null;
	'roles.uniqueRoleSets': object[];
	'selfmod.attachment': boolean;
	'selfmod.attachmentMaximum': number;
	'selfmod.attachmentDuration': number;
	'selfmod.attachmentAction': number;
	'selfmod.attachmentPunishmentDuration': number | null;
	'selfmod.capitals.enabled': boolean;
	'selfmod.capitals.minimum': number;
	'selfmod.capitals.maximum': number;
	'selfmod.capitals.softAction': number;
	'selfmod.capitals.hardAction': number;
	'selfmod.capitals.hardActionDuration': null;
	'selfmod.capitals.thresholdMaximum': number;
	'selfmod.capitals.thresholdDuration': number;
	'selfmod.newlines.enabled': boolean;
	'selfmod.newlines.maximum': number;
	'selfmod.newlines.softAction': number;
	'selfmod.newlines.hardAction': number;
	'selfmod.newlines.hardActionDuration': null;
	'selfmod.newlines.thresholdMaximum': number;
	'selfmod.newlines.thresholdDuration': number;
	'selfmod.invites.enabled': boolean;
	'selfmod.invites.softAction': number;
	'selfmod.invites.hardAction': number;
	'selfmod.invites.hardActionDuration': null;
	'selfmod.invites.thresholdMaximum': number;
	'selfmod.invites.thresholdDuration': number;
	'selfmod.filter.enabled': boolean;
	'selfmod.filter.softAction': number;
	'selfmod.filter.hardAction': number;
	'selfmod.filter.hardActionDuration': null;
	'selfmod.filter.thresholdMaximum': number;
	'selfmod.filter.thresholdDuration': number;
	'selfmod.filter.raw': string[];
	'selfmod.raid': boolean;
	'selfmod.raidthreshold': number;
	'selfmod.ignoreChannels': string[];
	'no-mention-spam.enabled': boolean;
	'no-mention-spam.alerts': boolean;
	'no-mention-spam.mentionsAllowed': number;
	'no-mention-spam.timePeriod': number;
	'social.achieve': boolean;
	'social.achieveMessage': string | null;
	'social.ignoreChannels': string[];
	'starboard.channel': string | null;
	'starboard.emoji': string;
	'starboard.ignoreChannels': string[];
	'starboard.minimum': number;
	'trigger.alias': object[];
	'trigger.includes': object[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS guilds (
		"id"                                   VARCHAR(19)                              NOT NULL,
		"prefix"                               VARCHAR(10)   DEFAULT 's!'               NOT NULL,
		"language"                             VARCHAR(5)    DEFAULT 'en-US'            NOT NULL,
		"disableNaturalPrefix"                 BOOLEAN       DEFAULT FALSE              NOT NULL,
		"disabledCommands"                     VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"commandUses"                          INTEGER       DEFAULT 0                  NOT NULL,
		"tags"                                 JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"permissions.users"                    JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"permissions.roles"                    JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"channels.announcements"               VARCHAR(19),
		"channels.greeting"                    VARCHAR(19),
		"channels.farewell"                    VARCHAR(19),
		"channels.member-logs"                 VARCHAR(19),
		"channels.message-logs"                VARCHAR(19),
		"channels.moderation-logs"             VARCHAR(19),
		"channels.nsfw-message-logs"           VARCHAR(19),
		"channels.image-logs"                  VARCHAR(19),
		"channels.roles"                       VARCHAR(19),
		"channels.spam"                        VARCHAR(19),
		"command-autodelete"                   JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"disabledChannels"                     VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"disabledCommandsChannels"             JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"events.banAdd"                        BOOLEAN       DEFAULT FALSE              NOT NULL,
		"events.banRemove"                     BOOLEAN       DEFAULT FALSE              NOT NULL,
		"events.memberAdd"                     BOOLEAN       DEFAULT FALSE              NOT NULL,
		"events.memberRemove"                  BOOLEAN       DEFAULT FALSE              NOT NULL,
		"events.messageDelete"                 BOOLEAN       DEFAULT FALSE              NOT NULL,
		"events.messageEdit"                   BOOLEAN       DEFAULT FALSE              NOT NULL,
		"messages.farewell"                    VARCHAR(2000),
		"messages.greeting"                    VARCHAR(2000),
		"messages.join-dm"                     VARCHAR(1500),
		"messages.ignoreChannels"              VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"messages.moderation-dm"               BOOLEAN       DEFAULT FALSE              NOT NULL,
		"messages.moderator-name-display"      BOOLEAN       DEFAULT TRUE               NOT NULL,
		"stickyRoles"                          JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.admin"                          VARCHAR(19),
		"roles.auto"                           JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.initial"                        VARCHAR(19),
		"roles.messageReaction"                VARCHAR(19),
		"roles.moderator"                      VARCHAR(19),
		"roles.muted"                          VARCHAR(19),
		"roles.public"                         VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"roles.reactions"                      JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"roles.removeInitial"                  BOOLEAN       DEFAULT FALSE              NOT NULL,
		"roles.staff"                          VARCHAR(19),
		"roles.dj"                             VARCHAR(19),
		"roles.subscriber"                     VARCHAR(19),
		"roles.uniqueRoleSets"                 JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"selfmod.attachment"                   BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.attachmentMaximum"            SMALLINT      DEFAULT 20                 NOT NULL,
		"selfmod.attachmentDuration"           SMALLINT      DEFAULT 20000              NOT NULL,
		"selfmod.attachmentAction"             SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.attachmentPunishmentDuration" INTEGER,
		"selfmod.capitals.enabled"             BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.capitals.minimum"             SMALLINT      DEFAULT 15                 NOT NULL,
		"selfmod.capitals.maximum"             SMALLINT      DEFAULT 50                 NOT NULL,
		"selfmod.capitals.softAction"          SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.capitals.hardAction"          SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.capitals.hardActionDuration"  INTEGER,
		"selfmod.capitals.thresholdMaximum"    SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.capitals.thresholdDuration"   INTEGER       DEFAULT 60000              NOT NULL,
		"selfmod.newlines.enabled"             BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.newlines.maximum"             SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.newlines.softAction"          SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.newlines.hardAction"          SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.newlines.hardActionDuration"  INTEGER,
		"selfmod.newlines.thresholdMaximum"    SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.newlines.thresholdDuration"   INTEGER       DEFAULT 60000              NOT NULL,
		"selfmod.invites.enabled"              BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.invites.softAction"           SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.invites.hardAction"           SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.invites.hardActionDuration"   INTEGER,
		"selfmod.invites.thresholdMaximum"     SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.invites.thresholdDuration"    INTEGER       DEFAULT 60000              NOT NULL,
		"selfmod.filter.enabled"               BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.filter.softAction"            SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.filter.hardAction"            SMALLINT      DEFAULT 0                  NOT NULL,
		"selfmod.filter.hardActionDuration"    INTEGER,
		"selfmod.filter.thresholdMaximum"      SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.filter.thresholdDuration"     INTEGER       DEFAULT 60000              NOT NULL,
		"selfmod.filter.raw"                   VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"selfmod.raid"                         BOOLEAN       DEFAULT FALSE              NOT NULL,
		"selfmod.raidthreshold"                SMALLINT      DEFAULT 10                 NOT NULL,
		"selfmod.ignoreChannels"               VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"no-mention-spam.enabled"              BOOLEAN       DEFAULT FALSE              NOT NULL,
		"no-mention-spam.alerts"               BOOLEAN       DEFAULT FALSE              NOT NULL,
		"no-mention-spam.mentionsAllowed"      SMALLINT      DEFAULT 20                 NOT NULL,
		"no-mention-spam.timePeriod"           INTEGER       DEFAULT 8                  NOT NULL,
		"social.achieve"                       BOOLEAN       DEFAULT FALSE              NOT NULL,
		"social.achieveMessage"                VARCHAR(2000),
		"social.ignoreChannels"                VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"starboard.channel"                    VARCHAR(19),
		"starboard.emoji"                      VARCHAR(75)   DEFAULT '%E2%AD%90'        NOT NULL,
		"starboard.ignoreChannels"             VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"starboard.minimum"                    SMALLINT      DEFAULT 1                  NOT NULL,
		"trigger.alias"                        JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"trigger.includes"                     JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
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
		CHECK("selfmod.raidthreshold" >= 2 AND "selfmod.raidthreshold" <= 50),
		CHECK("no-mention-spam.mentionsAllowed" >= 0),
		CHECK("no-mention-spam.timePeriod" >= 0),
		CHECK("starboard.minimum" >= 1)
	);
`;
