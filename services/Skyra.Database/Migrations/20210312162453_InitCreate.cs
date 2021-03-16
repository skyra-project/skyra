using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Skyra.Database.Migrations
{
	public partial class InitCreate : Migration
	{
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AlterDatabase()
				.Annotation("Npgsql:Enum:rpg_item_type_enum", "Weapon,Shield,Disposable,Special");

			migrationBuilder.CreateTable(
				"banner",
				table => new
				{
					id = table.Column<string>("character varying(6)", maxLength: 6, nullable: false),
					group = table.Column<string>("character varying(32)", maxLength: 32, nullable: false),
					title = table.Column<string>("character varying(128)", maxLength: 128, nullable: false),
					author_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					price = table.Column<int>("integer", nullable: false)
				},
				constraints: table => { table.PrimaryKey("pk_banner", x => x.id); });

			migrationBuilder.CreateTable(
				"client",
				table => new
				{
					id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false,
						defaultValueSql: "'365184854914236416'::character varying"),
					user_blocklist = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					user_boost = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					guild_blocklist = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					guild_boost = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]")
				},
				constraints: table => { table.PrimaryKey("pk_client", x => x.id); });

			migrationBuilder.CreateTable(
				"giveaway",
				table => new
				{
					guild_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					message_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					title = table.Column<string>("character varying(256)", maxLength: 256, nullable: false),
					ends_at = table.Column<DateTime>("timestamp without time zone", nullable: false),
					channel_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					minimum = table.Column<int>("integer", nullable: false, defaultValueSql: "1"),
					minimum_winners = table.Column<int>("integer", nullable: false, defaultValueSql: "1")
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_e73020907ca2a4b1ae14fce6e74", x => new {x.guild_id, x.message_id});
				});

			migrationBuilder.CreateTable(
				"guilds",
				table => new
				{
					id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					prefix = table.Column<string>("character varying(10)", maxLength: 10, nullable: false,
						defaultValueSql: "'sd!'::character varying"),
					language = table.Column<string>("character varying(5)", maxLength: 5, nullable: false,
						defaultValueSql: "'en-US'::character varying"),
					disableNaturalPrefix = table.Column<bool>("boolean", nullable: false),
					disabledCommands = table.Column<string[]>("character varying(32)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					customcommands = table.Column<string>(name: "custom-commands", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					permissionsusers = table.Column<string>(name: "permissions.users", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					permissionsroles = table.Column<string>(name: "permissions.roles", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					channelsannouncements = table.Column<string>(name: "channels.announcements",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsgreeting = table.Column<string>(name: "channels.greeting", type: "character varying(19)",
						maxLength: 19, nullable: true),
					channelsfarewell = table.Column<string>(name: "channels.farewell", type: "character varying(19)",
						maxLength: 19, nullable: true),
					channelsmemberlogs = table.Column<string>(name: "channels.member-logs",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsmessagelogs = table.Column<string>(name: "channels.message-logs",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsmoderationlogs = table.Column<string>(name: "channels.moderation-logs",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsnsfwmessagelogs = table.Column<string>(name: "channels.nsfw-message-logs",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsimagelogs = table.Column<string>(name: "channels.image-logs", type: "character varying(19)",
						maxLength: 19, nullable: true),
					channelsprunelogs = table.Column<string>(name: "channels.prune-logs", type: "character varying(19)",
						maxLength: 19, nullable: true),
					channelsreactionlogs = table.Column<string>(name: "channels.reaction-logs",
						type: "character varying(19)", maxLength: 19, nullable: true),
					channelsspam = table.Column<string>(name: "channels.spam", type: "character varying(19)",
						maxLength: 19, nullable: true),
					channelsignoreall = table.Column<string[]>(name: "channels.ignore.all",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					channelsignoremessageedit = table.Column<string[]>(name: "channels.ignore.message-edit",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					channelsignoremessagedelete = table.Column<string[]>(name: "channels.ignore.message-delete",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					channelsignorereactionadd = table.Column<string[]>(name: "channels.ignore.reaction-add",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					commandautodelete = table.Column<string>(name: "command-autodelete", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					disabledChannels = table.Column<string[]>("character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					disabledCommandsChannels =
						table.Column<string>("jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
					eventsbanAdd = table.Column<bool>(name: "events.banAdd", type: "boolean", nullable: false),
					eventsbanRemove = table.Column<bool>(name: "events.banRemove", type: "boolean", nullable: false),
					eventsmemberAdd = table.Column<bool>(name: "events.memberAdd", type: "boolean", nullable: false),
					eventsmemberRemove =
						table.Column<bool>(name: "events.memberRemove", type: "boolean", nullable: false),
					eventsmembernicknameupdate = table.Column<bool>(name: "events.member-nickname-update",
						type: "boolean", nullable: false),
					eventsmemberRoleUpdate =
						table.Column<bool>(name: "events.memberRoleUpdate", type: "boolean", nullable: false),
					eventsmessageDelete =
						table.Column<bool>(name: "events.messageDelete", type: "boolean", nullable: false),
					eventsmessageEdit =
						table.Column<bool>(name: "events.messageEdit", type: "boolean", nullable: false),
					eventstwemojireactions =
						table.Column<bool>(name: "events.twemoji-reactions", type: "boolean", nullable: false),
					messagesfarewell = table.Column<string>(name: "messages.farewell", type: "character varying(2000)",
						maxLength: 2000, nullable: true),
					messagesgreeting = table.Column<string>(name: "messages.greeting", type: "character varying(2000)",
						maxLength: 2000, nullable: true),
					messagesjoindm = table.Column<string>(name: "messages.join-dm", type: "character varying(1500)",
						maxLength: 1500, nullable: true),
					messagesignoreChannels = table.Column<string[]>(name: "messages.ignoreChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					messagesannouncementembed = table.Column<bool>(name: "messages.announcement-embed", type: "boolean",
						nullable: false),
					messagesmoderationdm =
						table.Column<bool>(name: "messages.moderation-dm", type: "boolean", nullable: false),
					messagesmoderationreasondisplay = table.Column<bool>(name: "messages.moderation-reason-display",
						type: "boolean", nullable: false, defaultValueSql: "true"),
					messagesmoderationmessagedisplay = table.Column<bool>(name: "messages.moderation-message-display",
						type: "boolean", nullable: false, defaultValueSql: "true"),
					messagesmoderationautodelete = table.Column<bool>(name: "messages.moderation-auto-delete",
						type: "boolean", nullable: false),
					messagesmoderatornamedisplay = table.Column<bool>(name: "messages.moderator-name-display",
						type: "boolean", nullable: false, defaultValueSql: "true"),
					stickyRoles = table.Column<string>("jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
					reactionroles = table.Column<string>(name: "reaction-roles", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					rolesadmin = table.Column<string[]>(name: "roles.admin", type: "character varying(19)[]",
						nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
					rolesauto = table.Column<string>(name: "roles.auto", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					rolesinitial = table.Column<string>(name: "roles.initial", type: "character varying(19)",
						maxLength: 19, nullable: true),
					rolesmoderator = table.Column<string[]>(name: "roles.moderator", type: "character varying(19)[]",
						nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
					rolesmuted = table.Column<string>(name: "roles.muted", type: "character varying(19)", maxLength: 19,
						nullable: true),
					rolesrestrictedreaction = table.Column<string>(name: "roles.restricted-reaction",
						type: "character varying(19)", maxLength: 19, nullable: true),
					rolesrestrictedembed = table.Column<string>(name: "roles.restricted-embed",
						type: "character varying(19)", maxLength: 19, nullable: true),
					rolesrestrictedemoji = table.Column<string>(name: "roles.restricted-emoji",
						type: "character varying(19)", maxLength: 19, nullable: true),
					rolesrestrictedattachment = table.Column<string>(name: "roles.restricted-attachment",
						type: "character varying(19)", maxLength: 19, nullable: true),
					rolesrestrictedvoice = table.Column<string>(name: "roles.restricted-voice",
						type: "character varying(19)", maxLength: 19, nullable: true),
					rolespublic = table.Column<string[]>(name: "roles.public", type: "character varying(19)[]",
						nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
					rolesremoveInitial =
						table.Column<bool>(name: "roles.removeInitial", type: "boolean", nullable: false),
					rolesdj = table.Column<string[]>(name: "roles.dj", type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					rolessubscriber = table.Column<string>(name: "roles.subscriber", type: "character varying(19)",
						maxLength: 19, nullable: true),
					rolesuniqueRoleSets = table.Column<string>(name: "roles.uniqueRoleSets", type: "jsonb",
						nullable: false, defaultValueSql: "'[]'::jsonb"),
					selfmodattachmentsenabled = table.Column<bool>(name: "selfmod.attachments.enabled", type: "boolean",
						nullable: false),
					selfmodattachmentsignoredRoles = table.Column<string[]>(name: "selfmod.attachments.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodattachmentsignoredChannels = table.Column<string[]>(
						name: "selfmod.attachments.ignoredChannels", type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodattachmentssoftAction = table.Column<short>(name: "selfmod.attachments.softAction",
						type: "smallint", nullable: false),
					selfmodattachmentshardAction = table.Column<short>(name: "selfmod.attachments.hardAction",
						type: "smallint", nullable: false),
					selfmodattachmentshardActionDuration =
						table.Column<int>(name: "selfmod.attachments.hardActionDuration", type: "integer",
							nullable: true),
					selfmodattachmentsthresholdMaximum = table.Column<short>(
						name: "selfmod.attachments.thresholdMaximum", type: "smallint", nullable: false,
						defaultValueSql: "10"),
					selfmodattachmentsthresholdDuration = table.Column<int>(
						name: "selfmod.attachments.thresholdDuration", type: "integer", nullable: false,
						defaultValueSql: "60000"),
					selfmodcapitalsenabled =
						table.Column<bool>(name: "selfmod.capitals.enabled", type: "boolean", nullable: false),
					selfmodcapitalsignoredRoles = table.Column<string[]>(name: "selfmod.capitals.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodcapitalsignoredChannels = table.Column<string[]>(name: "selfmod.capitals.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodcapitalsminimum = table.Column<short>(name: "selfmod.capitals.minimum", type: "smallint",
						nullable: false, defaultValueSql: "15"),
					selfmodcapitalsmaximum = table.Column<short>(name: "selfmod.capitals.maximum", type: "smallint",
						nullable: false, defaultValueSql: "50"),
					selfmodcapitalssoftAction = table.Column<short>(name: "selfmod.capitals.softAction",
						type: "smallint", nullable: false),
					selfmodcapitalshardAction = table.Column<short>(name: "selfmod.capitals.hardAction",
						type: "smallint", nullable: false),
					selfmodcapitalshardActionDuration = table.Column<int>(name: "selfmod.capitals.hardActionDuration",
						type: "integer", nullable: true),
					selfmodcapitalsthresholdMaximum = table.Column<short>(name: "selfmod.capitals.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodcapitalsthresholdDuration = table.Column<int>(name: "selfmod.capitals.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodlinksenabled =
						table.Column<bool>(name: "selfmod.links.enabled", type: "boolean", nullable: false),
					selfmodlinkswhitelist = table.Column<string[]>(name: "selfmod.links.whitelist",
						type: "character varying(128)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodlinksignoredRoles = table.Column<string[]>(name: "selfmod.links.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodlinksignoredChannels = table.Column<string[]>(name: "selfmod.links.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodlinkssoftAction = table.Column<short>(name: "selfmod.links.softAction", type: "smallint",
						nullable: false),
					selfmodlinkshardAction = table.Column<short>(name: "selfmod.links.hardAction", type: "smallint",
						nullable: false),
					selfmodlinkshardActionDuration = table.Column<int>(name: "selfmod.links.hardActionDuration",
						type: "integer", nullable: true),
					selfmodlinksthresholdMaximum = table.Column<short>(name: "selfmod.links.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodlinksthresholdDuration = table.Column<int>(name: "selfmod.links.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodmessagesenabled =
						table.Column<bool>(name: "selfmod.messages.enabled", type: "boolean", nullable: false),
					selfmodmessagesignoredRoles = table.Column<string[]>(name: "selfmod.messages.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodmessagesignoredChannels = table.Column<string[]>(name: "selfmod.messages.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodmessagesmaximum = table.Column<short>(name: "selfmod.messages.maximum", type: "smallint",
						nullable: false, defaultValueSql: "5"),
					selfmodmessagesqueuesize = table.Column<short>(name: "selfmod.messages.queue-size",
						type: "smallint", nullable: false, defaultValueSql: "50"),
					selfmodmessagessoftAction = table.Column<short>(name: "selfmod.messages.softAction",
						type: "smallint", nullable: false),
					selfmodmessageshardAction = table.Column<short>(name: "selfmod.messages.hardAction",
						type: "smallint", nullable: false),
					selfmodmessageshardActionDuration = table.Column<int>(name: "selfmod.messages.hardActionDuration",
						type: "integer", nullable: true),
					selfmodmessagesthresholdMaximum = table.Column<short>(name: "selfmod.messages.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodmessagesthresholdDuration = table.Column<int>(name: "selfmod.messages.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodnewlinesenabled =
						table.Column<bool>(name: "selfmod.newlines.enabled", type: "boolean", nullable: false),
					selfmodnewlinesignoredRoles = table.Column<string[]>(name: "selfmod.newlines.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodnewlinesignoredChannels = table.Column<string[]>(name: "selfmod.newlines.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodnewlinesmaximum = table.Column<short>(name: "selfmod.newlines.maximum", type: "smallint",
						nullable: false, defaultValueSql: "20"),
					selfmodnewlinessoftAction = table.Column<short>(name: "selfmod.newlines.softAction",
						type: "smallint", nullable: false),
					selfmodnewlineshardAction = table.Column<short>(name: "selfmod.newlines.hardAction",
						type: "smallint", nullable: false),
					selfmodnewlineshardActionDuration = table.Column<int>(name: "selfmod.newlines.hardActionDuration",
						type: "integer", nullable: true),
					selfmodnewlinesthresholdMaximum = table.Column<short>(name: "selfmod.newlines.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodnewlinesthresholdDuration = table.Column<int>(name: "selfmod.newlines.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodinvitesenabled =
						table.Column<bool>(name: "selfmod.invites.enabled", type: "boolean", nullable: false),
					selfmodinvitesignoredCodes = table.Column<string[]>(name: "selfmod.invites.ignoredCodes",
						type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodinvitesignoredGuilds = table.Column<string[]>(name: "selfmod.invites.ignoredGuilds",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodinvitesignoredRoles = table.Column<string[]>(name: "selfmod.invites.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodinvitesignoredChannels = table.Column<string[]>(name: "selfmod.invites.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodinvitessoftAction = table.Column<short>(name: "selfmod.invites.softAction", type: "smallint",
						nullable: false),
					selfmodinviteshardAction = table.Column<short>(name: "selfmod.invites.hardAction", type: "smallint",
						nullable: false),
					selfmodinviteshardActionDuration = table.Column<int>(name: "selfmod.invites.hardActionDuration",
						type: "integer", nullable: true),
					selfmodinvitesthresholdMaximum = table.Column<short>(name: "selfmod.invites.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodinvitesthresholdDuration = table.Column<int>(name: "selfmod.invites.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodfilterenabled =
						table.Column<bool>(name: "selfmod.filter.enabled", type: "boolean", nullable: false),
					selfmodfilterraw = table.Column<string[]>(name: "selfmod.filter.raw",
						type: "character varying(32)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodfilterignoredRoles = table.Column<string[]>(name: "selfmod.filter.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodfilterignoredChannels = table.Column<string[]>(name: "selfmod.filter.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodfiltersoftAction = table.Column<short>(name: "selfmod.filter.softAction", type: "smallint",
						nullable: false),
					selfmodfilterhardAction = table.Column<short>(name: "selfmod.filter.hardAction", type: "smallint",
						nullable: false),
					selfmodfilterhardActionDuration = table.Column<int>(name: "selfmod.filter.hardActionDuration",
						type: "integer", nullable: true),
					selfmodfilterthresholdMaximum = table.Column<short>(name: "selfmod.filter.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodfilterthresholdDuration = table.Column<int>(name: "selfmod.filter.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodreactionsenabled = table.Column<bool>(name: "selfmod.reactions.enabled", type: "boolean",
						nullable: false),
					selfmodreactionsignoredRoles = table.Column<string[]>(name: "selfmod.reactions.ignoredRoles",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodreactionsignoredChannels = table.Column<string[]>(name: "selfmod.reactions.ignoredChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodreactionsmaximum = table.Column<short>(name: "selfmod.reactions.maximum", type: "smallint",
						nullable: false, defaultValueSql: "10"),
					selfmodreactionswhitelist = table.Column<string[]>(name: "selfmod.reactions.whitelist",
						type: "character varying(128)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodreactionsblacklist = table.Column<string[]>(name: "selfmod.reactions.blacklist",
						type: "character varying(128)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					selfmodreactionssoftAction = table.Column<short>(name: "selfmod.reactions.softAction",
						type: "smallint", nullable: false),
					selfmodreactionshardAction = table.Column<short>(name: "selfmod.reactions.hardAction",
						type: "smallint", nullable: false),
					selfmodreactionshardActionDuration = table.Column<int>(name: "selfmod.reactions.hardActionDuration",
						type: "integer", nullable: true),
					selfmodreactionsthresholdMaximum = table.Column<short>(name: "selfmod.reactions.thresholdMaximum",
						type: "smallint", nullable: false, defaultValueSql: "10"),
					selfmodreactionsthresholdDuration = table.Column<int>(name: "selfmod.reactions.thresholdDuration",
						type: "integer", nullable: false, defaultValueSql: "60000"),
					selfmodraid = table.Column<bool>(name: "selfmod.raid", type: "boolean", nullable: false),
					selfmodraidthreshold = table.Column<short>(name: "selfmod.raidthreshold", type: "smallint",
						nullable: false, defaultValueSql: "10"),
					selfmodignoreChannels = table.Column<string[]>(name: "selfmod.ignoreChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					nomentionspamenabled =
						table.Column<bool>(name: "no-mention-spam.enabled", type: "boolean", nullable: false),
					nomentionspamalerts =
						table.Column<bool>(name: "no-mention-spam.alerts", type: "boolean", nullable: false),
					nomentionspammentionsAllowed = table.Column<short>(name: "no-mention-spam.mentionsAllowed",
						type: "smallint", nullable: false, defaultValueSql: "20"),
					nomentionspamtimePeriod = table.Column<int>(name: "no-mention-spam.timePeriod", type: "integer",
						nullable: false, defaultValueSql: "8"),
					socialenabled = table.Column<bool>(name: "social.enabled", type: "boolean", nullable: false,
						defaultValueSql: "true"),
					socialachieve = table.Column<bool>(name: "social.achieve", type: "boolean", nullable: false),
					socialachieveMessage = table.Column<string>(name: "social.achieveMessage",
						type: "character varying(2000)", maxLength: 2000, nullable: true),
					socialmultiplier = table.Column<decimal>(name: "social.multiplier", type: "numeric(53)",
						precision: 53, nullable: false, defaultValueSql: "1"),
					socialignoreChannels = table.Column<string[]>(name: "social.ignoreChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					starboardchannel = table.Column<string>(name: "starboard.channel", type: "character varying(19)",
						maxLength: 19, nullable: true),
					starboardemoji = table.Column<string>(name: "starboard.emoji", type: "character varying(75)",
						maxLength: 75, nullable: false, defaultValueSql: "'%E2%AD%90'::character varying"),
					starboardignoreChannels = table.Column<string[]>(name: "starboard.ignoreChannels",
						type: "character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					starboardminimum = table.Column<short>(name: "starboard.minimum", type: "smallint", nullable: false,
						defaultValueSql: "1"),
					starboardselfStar =
						table.Column<bool>(name: "starboard.selfStar", type: "boolean", nullable: false),
					triggeralias = table.Column<string>(name: "trigger.alias", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					triggerincludes = table.Column<string>(name: "trigger.includes", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					musicdefaultvolume = table.Column<short>(name: "music.default-volume", type: "smallint",
						nullable: false, defaultValueSql: "100"),
					musicmaximumduration = table.Column<int>(name: "music.maximum-duration", type: "integer",
						nullable: false, defaultValueSql: "7200000"),
					musicmaximumentriesperuser = table.Column<short>(name: "music.maximum-entries-per-user",
						type: "smallint", nullable: false, defaultValueSql: "100"),
					musicallowstreams = table.Column<bool>(name: "music.allow-streams", type: "boolean",
						nullable: false, defaultValueSql: "true"),
					notificationsstreamstwitchstreamers = table.Column<string>(
						name: "notifications.streams.twitch.streamers", type: "jsonb", nullable: false,
						defaultValueSql: "'[]'::jsonb"),
					suggestionsemojisupvote = table.Column<string>(name: "suggestions.emojis.upvote",
						type: "character varying(128)", maxLength: 128, nullable: false,
						defaultValueSql: "':ArrowT:694594285487652954'::character varying"),
					suggestionsemojisdownvote = table.Column<string>(name: "suggestions.emojis.downvote",
						type: "character varying(128)", maxLength: 128, nullable: false,
						defaultValueSql: "':ArrowB:694594285269680179'::character varying"),
					suggestionschannel = table.Column<string>(name: "suggestions.channel",
						type: "character varying(19)", maxLength: 19, nullable: true),
					suggestionsonactiondm =
						table.Column<bool>(name: "suggestions.on-action.dm", type: "boolean", nullable: false),
					suggestionsonactionrepost = table.Column<bool>(name: "suggestions.on-action.repost",
						type: "boolean", nullable: false),
					suggestionsonactionhideauthor = table.Column<bool>(name: "suggestions.on-action.hide-author",
						type: "boolean", nullable: false),
					eventsmemberusernameupdate = table.Column<bool>(name: "events.member-username-update",
						type: "boolean", nullable: true, defaultValueSql: "false")
				},
				constraints: table => { table.PrimaryKey("pk_guilds", x => x.id); });

			migrationBuilder.CreateTable(
				"member",
				table => new
				{
					guild_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					points = table.Column<long>("bigint", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_923cd70108499f5f72ae286417c", x => new {x.guild_id, x.user_id});
				});

			migrationBuilder.CreateTable(
				"migrations",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					timestamp = table.Column<long>("bigint", nullable: false),
					name = table.Column<string>("character varying", nullable: false)
				},
				constraints: table => { table.PrimaryKey("pk_migrations", x => x.id); });

			migrationBuilder.CreateTable(
				"moderation",
				table => new
				{
					case_id = table.Column<int>("integer", nullable: false),
					guild_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					created_at = table.Column<DateTime>("timestamp without time zone", nullable: true),
					duration = table.Column<int>("integer", nullable: true),
					extra_data = table.Column<string>("json", nullable: true),
					moderator_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false,
						defaultValueSql: "'365184854914236416'::character varying"),
					reason = table.Column<string>("character varying(2000)", maxLength: 2000, nullable: true,
						defaultValueSql: "NULL::character varying"),
					image_url = table.Column<string>("character varying(2000)", maxLength: 2000, nullable: true,
						defaultValueSql: "NULL::character varying"),
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: true,
						defaultValueSql: "NULL::character varying"),
					type = table.Column<short>("smallint", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_e9ec6c684894a7067a45b7ae4f6", x => new {x.case_id, x.guild_id});
				});

			migrationBuilder.CreateTable(
				"rpg_class",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					name = table.Column<string>("character varying(20)", maxLength: 20, nullable: false),
					attack_multiplier = table.Column<double>("double precision", nullable: false, defaultValueSql: "1"),
					defense_multiplier =
						table.Column<double>("double precision", nullable: false, defaultValueSql: "1"),
					agility_multiplier =
						table.Column<double>("double precision", nullable: false, defaultValueSql: "1"),
					energy_multiplier = table.Column<double>("double precision", nullable: false, defaultValueSql: "1"),
					luck_multiplier = table.Column<double>("double precision", nullable: false, defaultValueSql: "1")
				},
				constraints: table => { table.PrimaryKey("pk_rpg_class", x => x.id); });

			migrationBuilder.CreateTable(
				"rpg_guild",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					name = table.Column<string>("character varying(50)", maxLength: 50, nullable: false),
					description = table.Column<string>("character varying(200)", maxLength: 200, nullable: true),
					member_limit = table.Column<short>("smallint", nullable: false, defaultValueSql: "5"),
					win_count = table.Column<long>("bigint", nullable: false),
					lose_count = table.Column<long>("bigint", nullable: false),
					money_count = table.Column<long>("bigint", nullable: false),
					bank_limit = table.Column<long>("bigint", nullable: false, defaultValueSql: "50000"),
					upgrade = table.Column<short>("smallint", nullable: false)
				},
				constraints: table => { table.PrimaryKey("pk_rpg_guild", x => x.id); });

			migrationBuilder.CreateTable(
				"rpg_item",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					name = table.Column<string>("character varying(50)", maxLength: 50, nullable: false),
					maximum_durability = table.Column<int>("integer", nullable: false),
					maximum_cooldown = table.Column<short>("smallint", nullable: false),
					attack = table.Column<double>("double precision", nullable: false),
					defense = table.Column<double>("double precision", nullable: false),
					health = table.Column<double>("double precision", nullable: false),
					required_energy = table.Column<double>("double precision", nullable: false),
					rarity = table.Column<int>("integer", nullable: false),
					accuracy = table.Column<short>("smallint", nullable: false),
					effects = table.Column<string>("jsonb", nullable: false, defaultValueSql: "'{}'::jsonb")
				},
				constraints: table => { table.PrimaryKey("pk_rpg_item", x => x.id); });

			migrationBuilder.CreateTable(
				"schedule",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					task_id = table.Column<string>("character varying", nullable: false),
					time = table.Column<DateTime>("timestamp without time zone", nullable: false),
					recurring = table.Column<string>("character varying", nullable: true),
					catch_up = table.Column<bool>("boolean", nullable: false, defaultValueSql: "true"),
					data = table.Column<string>("jsonb", nullable: false)
				},
				constraints: table => { table.PrimaryKey("pk_schedule", x => x.id); });

			migrationBuilder.CreateTable(
				"starboard",
				table => new
				{
					message_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					guild_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					enabled = table.Column<bool>("boolean", nullable: false),
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					channel_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					star_message_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: true),
					stars = table.Column<int>("integer", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_4bd6406cf1cf6cff7e9de1fafd2", x => new {x.message_id, x.guild_id});
				});

			migrationBuilder.CreateTable(
				"suggestion",
				table => new
				{
					id = table.Column<int>("integer", nullable: false),
					guild_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					message_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					author_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_5a7d999d79058230627a279853a", x => new {x.id, x.guild_id});
				});

			migrationBuilder.CreateTable(
				"twitch_stream_subscription",
				table => new
				{
					id = table.Column<string>("character varying(16)", maxLength: 16, nullable: false),
					is_streaming = table.Column<bool>("boolean", nullable: false),
					expires_at = table.Column<DateTime>("timestamp without time zone", nullable: false),
					guild_ids = table.Column<string[]>("character varying(19)[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]")
				},
				constraints: table => { table.PrimaryKey("pk_twitch_stream_subscription", x => x.id); });

			migrationBuilder.CreateTable(
				"user",
				table => new
				{
					id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					points = table.Column<int>("integer", nullable: false),
					reputations = table.Column<int>("integer", nullable: false),
					moderation_dm = table.Column<bool>("boolean", nullable: false, defaultValueSql: "true"),
					money = table.Column<long>("bigint", nullable: false)
				},
				constraints: table => { table.PrimaryKey("pk_user", x => x.id); });

			migrationBuilder.CreateTable(
				"rpg_guild_rank",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					name = table.Column<string>("character varying(50)", maxLength: 50, nullable: false),
					guild_id = table.Column<int>("integer", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("pk_rpg_guild_rank", x => x.id);
					table.ForeignKey(
						"FK_ddc84b6edbf93fd59d9cc819bd0",
						x => x.guild_id,
						"rpg_guild",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"rpg_user_item",
				table => new
				{
					id = table.Column<long>("bigint", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					durability = table.Column<int>("integer", nullable: false),
					item_id = table.Column<int>("integer", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("pk_rpg_user_item", x => x.id);
					table.ForeignKey(
						"FK_0babac6e86746fb7ab492f6d948",
						x => x.item_id,
						"rpg_item",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"user_cooldown",
				table => new
				{
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					daily = table.Column<DateTime>("timestamp without time zone", nullable: true),
					reputation = table.Column<DateTime>("timestamp without time zone", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_1950d1f438c5dfe9bc6b8cc3531", x => x.user_id);
					table.ForeignKey(
						"FK_1950d1f438c5dfe9bc6b8cc3531",
						x => x.user_id,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"user_game_integration",
				table => new
				{
					id = table.Column<int>("integer", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					game = table.Column<string>("character varying(35)", maxLength: 35, nullable: false),
					extra_data = table.Column<string>("jsonb", nullable: false),
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("pk_user_game_integration", x => x.id);
					table.ForeignKey(
						"FK_06e1223a9d5945e11f022e6a1c6",
						x => x.user_id,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"user_profile",
				table => new
				{
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					banners = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					public_badges = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					badges = table.Column<string[]>("character varying[]", nullable: false,
						defaultValueSql: "ARRAY[]::character varying[]"),
					color = table.Column<int>("integer", nullable: false),
					vault = table.Column<long>("bigint", nullable: false),
					banner_level = table.Column<string>("character varying(6)", maxLength: 6, nullable: false,
						defaultValueSql: "'1001'::character varying"),
					banner_profile = table.Column<string>("character varying(6)", maxLength: 6, nullable: false,
						defaultValueSql: "'0001'::character varying"),
					dark_theme = table.Column<bool>("boolean", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_0468eeca19838d4337cb8f1ec93", x => x.user_id);
					table.ForeignKey(
						"FK_0468eeca19838d4337cb8f1ec93",
						x => x.user_id,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"user_spouses_user",
				table => new
				{
					user_id_1 = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					user_id_2 = table.Column<string>("character varying(19)", maxLength: 19, nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_d03519ca87f9a551e7623625f17", x => new {x.user_id_1, x.user_id_2});
					table.ForeignKey(
						"FK_039ee960316593d0e8102ae6c51",
						x => x.user_id_2,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						"FK_6bbc6de75851eb64e17c07a6a94",
						x => x.user_id_1,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				"rpg_user",
				table => new
				{
					user_id = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					name = table.Column<string>("character varying(32)", maxLength: 32, nullable: false),
					win_count = table.Column<long>("bigint", nullable: false),
					death_count = table.Column<long>("bigint", nullable: false),
					crate_common_count = table.Column<int>("integer", nullable: false),
					crate_uncommon_count = table.Column<int>("integer", nullable: false),
					crate_rare_count = table.Column<int>("integer", nullable: false),
					crate_legendary_count = table.Column<int>("integer", nullable: false),
					attack = table.Column<int>("integer", nullable: false),
					health = table.Column<int>("integer", nullable: false),
					agility = table.Column<int>("integer", nullable: false),
					energy = table.Column<int>("integer", nullable: false),
					luck = table.Column<int>("integer", nullable: false),
					class_id = table.Column<int>("integer", nullable: true),
					equipped_item_id = table.Column<long>("bigint", nullable: true),
					guild_id = table.Column<int>("integer", nullable: true),
					guild_rank_id = table.Column<int>("integer", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_719f657879066b0981260ccc7b2", x => x.user_id);
					table.ForeignKey(
						"FK_6fd419cf9dad38d6b37c244b172",
						x => x.guild_rank_id,
						"rpg_guild_rank",
						"id",
						onDelete: ReferentialAction.SetNull);
					table.ForeignKey(
						"FK_719f657879066b0981260ccc7b2",
						x => x.user_id,
						"user",
						"id",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						"FK_776e8e9d0df635e6be8b40c3507",
						x => x.guild_id,
						"rpg_guild",
						"id",
						onDelete: ReferentialAction.SetNull);
					table.ForeignKey(
						"FK_a925752b2be93dab947e57f17b2",
						x => x.class_id,
						"rpg_class",
						"id",
						onDelete: ReferentialAction.SetNull);
					table.ForeignKey(
						"FK_fdd476ddaed81357d7ddbdca883",
						x => x.equipped_item_id,
						"rpg_user_item",
						"id",
						onDelete: ReferentialAction.SetNull);
				});

			migrationBuilder.CreateTable(
				"rpg_battle",
				table => new
				{
					id = table.Column<long>("bigint", nullable: false)
						.Annotation("Npgsql:ValueGenerationStrategy",
							NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
					challenger_turn = table.Column<bool>("boolean", nullable: false),
					challenger_cooldown = table.Column<short>("smallint", nullable: false),
					challenger_health = table.Column<int>("integer", nullable: false),
					challenger_energy = table.Column<int>("integer", nullable: false),
					challenger_effects = table.Column<string>("jsonb", nullable: false),
					challenged_cooldown = table.Column<short>("smallint", nullable: false),
					challenged_health = table.Column<int>("integer", nullable: false),
					challenged_energy = table.Column<int>("integer", nullable: false),
					challenged_effects = table.Column<string>("jsonb", nullable: false),
					challenged_user = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					challenged_weapon_id = table.Column<long>("bigint", nullable: true),
					challenger_user = table.Column<string>("character varying(19)", maxLength: 19, nullable: false),
					challenger_weapon_id = table.Column<long>("bigint", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("pk_rpg_battle", x => x.id);
					table.ForeignKey(
						"FK_36e1b3bf944502050aa76aa399a",
						x => x.challenged_user,
						"rpg_user",
						"user_id",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						"FK_44cf95cf9e6634b2f87f8159477",
						x => x.challenged_weapon_id,
						"rpg_user_item",
						"id",
						onDelete: ReferentialAction.SetNull);
					table.ForeignKey(
						"FK_5230797f292df6a36d1fb5f0f09",
						x => x.challenger_user,
						"rpg_user",
						"user_id",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						"FK_e3997bc3dd2ed9164b7a1a85f02",
						x => x.challenger_weapon_id,
						"rpg_user_item",
						"id",
						onDelete: ReferentialAction.SetNull);
				});

			migrationBuilder.CreateIndex(
				"ix_rpg_battle_challenged_user",
				"rpg_battle",
				"challenged_user",
				unique: true);

			migrationBuilder.CreateIndex(
				"ix_rpg_battle_challenged_weapon_id",
				"rpg_battle",
				"challenged_weapon_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_battle_challenger_user",
				"rpg_battle",
				"challenger_user",
				unique: true);

			migrationBuilder.CreateIndex(
				"ix_rpg_battle_challenger_weapon_id",
				"rpg_battle",
				"challenger_weapon_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_class_name",
				"rpg_class",
				"name",
				unique: true);

			migrationBuilder.CreateIndex(
				"ix_rpg_guild_rank_guild_id",
				"rpg_guild_rank",
				"guild_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_item_name_rarity",
				"rpg_item",
				new[] {"name", "rarity"},
				unique: true);

			migrationBuilder.CreateIndex(
				"ix_rpg_user_class_id",
				"rpg_user",
				"class_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_user_equipped_item_id",
				"rpg_user",
				"equipped_item_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_user_guild_id",
				"rpg_user",
				"guild_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_user_guild_rank_id",
				"rpg_user",
				"guild_rank_id");

			migrationBuilder.CreateIndex(
				"ix_rpg_user_item_item_id",
				"rpg_user_item",
				"item_id");

			migrationBuilder.CreateIndex(
				"ix_user_game_integration_user_id",
				"user_game_integration",
				"user_id");

			migrationBuilder.CreateIndex(
				"ix_user_spouses_user_user_id_1",
				"user_spouses_user",
				"user_id_1");

			migrationBuilder.CreateIndex(
				"ix_user_spouses_user_user_id_2",
				"user_spouses_user",
				"user_id_2");
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				"banner");

			migrationBuilder.DropTable(
				"client");

			migrationBuilder.DropTable(
				"giveaway");

			migrationBuilder.DropTable(
				"guilds");

			migrationBuilder.DropTable(
				"member");

			migrationBuilder.DropTable(
				"migrations");

			migrationBuilder.DropTable(
				"moderation");

			migrationBuilder.DropTable(
				"rpg_battle");

			migrationBuilder.DropTable(
				"schedule");

			migrationBuilder.DropTable(
				"starboard");

			migrationBuilder.DropTable(
				"suggestion");

			migrationBuilder.DropTable(
				"twitch_stream_subscription");

			migrationBuilder.DropTable(
				"user_cooldown");

			migrationBuilder.DropTable(
				"user_game_integration");

			migrationBuilder.DropTable(
				"user_profile");

			migrationBuilder.DropTable(
				"user_spouses_user");

			migrationBuilder.DropTable(
				"rpg_user");

			migrationBuilder.DropTable(
				"rpg_guild_rank");

			migrationBuilder.DropTable(
				"user");

			migrationBuilder.DropTable(
				"rpg_class");

			migrationBuilder.DropTable(
				"rpg_user_item");

			migrationBuilder.DropTable(
				"rpg_guild");

			migrationBuilder.DropTable(
				"rpg_item");
		}
	}
}
