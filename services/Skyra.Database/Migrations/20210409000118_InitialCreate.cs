using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Skyra.Database.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:rpg_item_type_enum", "Weapon,Shield,Disposable,Special");

            migrationBuilder.CreateTable(
                name: "banner",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    group = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    title = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    author_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    price = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_banner", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "client",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false, defaultValueSql: "'365184854914236416'::character varying"),
                    user_blocklist = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    user_boost = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    guild_blocklist = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    guild_boost = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_client", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "giveaway",
                columns: table => new
                {
                    guild_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    message_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ends_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    channel_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    minimum = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "1"),
                    minimum_winners = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "1"),
                    allowed_roles = table.Column<string[]>(type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_e73020907ca2a4b1ae14fce6e74", x => new { x.guild_id, x.message_id });
                });

            migrationBuilder.CreateTable(
                name: "guilds",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    prefix = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValueSql: "'sd!'::character varying"),
                    language = table.Column<string>(type: "text", nullable: false, defaultValueSql: "'en-US'::character varying"),
                    disablenaturalprefix = table.Column<bool>(name: "disable-natural-prefix", type: "boolean", nullable: false, defaultValueSql: "false"),
                    disabledcommands = table.Column<string[]>(name: "disabled-commands", type: "character varying(32)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    customcommands = table.Column<string>(name: "custom-commands", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    permissionsusers = table.Column<string>(name: "permissions.users", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    permissionsroles = table.Column<string>(name: "permissions.roles", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    channelsannouncements = table.Column<string>(name: "channels.announcements", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelsgreeting = table.Column<string>(name: "channels.greeting", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelsfarewell = table.Column<string>(name: "channels.farewell", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelsspam = table.Column<string>(name: "channels.spam", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsmember = table.Column<string>(name: "channels.logs.member", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsmessage = table.Column<string>(name: "channels.logs.message", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsmoderation = table.Column<string>(name: "channels.logs.moderation", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsnsfwmessage = table.Column<string>(name: "channels.logs.nsfw-message", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsimage = table.Column<string>(name: "channels.logs.image", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsprune = table.Column<string>(name: "channels.logs.prune", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsreaction = table.Column<string>(name: "channels.logs.reaction", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsrolecreate = table.Column<string>(name: "channels.logs.role-create", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsroleupdate = table.Column<string>(name: "channels.logs.role-update", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsroledelete = table.Column<string>(name: "channels.logs.role-delete", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogschannelcreate = table.Column<string>(name: "channels.logs.channel-create", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogschannelupdate = table.Column<string>(name: "channels.logs.channel-update", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogschanneldelete = table.Column<string>(name: "channels.logs.channel-delete", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsemojicreate = table.Column<string>(name: "channels.logs.emoji-create", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsemojiupdate = table.Column<string>(name: "channels.logs.emoji-update", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsemojidelete = table.Column<string>(name: "channels.logs.emoji-delete", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelslogsserverupdate = table.Column<string>(name: "channels.logs.server-update", type: "character varying(19)", maxLength: 19, nullable: true),
                    channelsignoreall = table.Column<string[]>(name: "channels.ignore.all", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    channelsignoremessageedit = table.Column<string[]>(name: "channels.ignore.message-edit", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    channelsignoremessagedelete = table.Column<string[]>(name: "channels.ignore.message-delete", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    channelsignorereactionadd = table.Column<string[]>(name: "channels.ignore.reaction-add", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    commandautodelete = table.Column<string>(name: "command-auto-delete", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    disabledchannels = table.Column<string[]>(name: "disabled-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    disabledcommandschannels = table.Column<string>(name: "disabled-commands-channels", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    eventsbanadd = table.Column<bool>(name: "events.ban-add", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsbanremove = table.Column<bool>(name: "events.ban-remove", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmemberadd = table.Column<bool>(name: "events.member-add", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmemberremove = table.Column<bool>(name: "events.member-remove", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmembernicknameupdate = table.Column<bool>(name: "events.member-nickname-update", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmemberroleupdate = table.Column<bool>(name: "events.member-role-update", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmessagedelete = table.Column<bool>(name: "events.message-delete", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmessageedit = table.Column<bool>(name: "events.message-edit", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventstwemojireactions = table.Column<bool>(name: "events.twemoji-reactions", type: "boolean", nullable: false, defaultValueSql: "false"),
                    messagesfarewell = table.Column<string>(name: "messages.farewell", type: "character varying(2000)", maxLength: 2000, nullable: true),
                    messagesgreeting = table.Column<string>(name: "messages.greeting", type: "character varying(2000)", maxLength: 2000, nullable: true),
                    messagesjoindm = table.Column<string>(name: "messages.join-dm", type: "character varying(1500)", maxLength: 1500, nullable: true),
                    messagesignorechannels = table.Column<string[]>(name: "messages.ignore-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    messagesannouncementembed = table.Column<bool>(name: "messages.announcement-embed", type: "boolean", nullable: false, defaultValueSql: "false"),
                    messagesmoderationdm = table.Column<bool>(name: "messages.moderation-dm", type: "boolean", nullable: false, defaultValueSql: "false"),
                    messagesmoderationreasondisplay = table.Column<bool>(name: "messages.moderation-reason-display", type: "boolean", nullable: false, defaultValueSql: "true"),
                    messagesmoderationmessagedisplay = table.Column<bool>(name: "messages.moderation-message-display", type: "boolean", nullable: false, defaultValueSql: "true"),
                    messagesmoderationautodelete = table.Column<bool>(name: "messages.moderation-auto-delete", type: "boolean", nullable: false, defaultValueSql: "false"),
                    messagesmoderatornamedisplay = table.Column<bool>(name: "messages.moderator-name-display", type: "boolean", nullable: false, defaultValueSql: "true"),
                    messagesautodeleteignoredall = table.Column<bool>(name: "messages.auto-delete.ignored-all", type: "boolean", nullable: false, defaultValueSql: "false"),
                    messagesautodeleteignoredroles = table.Column<string[]>(name: "messages.auto-delete.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    messagesautodeleteignoredchannels = table.Column<string[]>(name: "messages.auto-delete.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    messagesautodeleteignoredcommands = table.Column<string[]>(name: "messages.auto-delete.ignored-commands", type: "character varying(32)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    stickyroles = table.Column<string>(name: "sticky-roles", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    reactionroles = table.Column<string>(name: "reaction-roles", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    rolesadmin = table.Column<string[]>(name: "roles.admin", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    rolesauto = table.Column<string>(name: "roles.auto", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    rolesinitial = table.Column<string>(name: "roles.initial", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesmoderator = table.Column<string[]>(name: "roles.moderator", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    rolesmuted = table.Column<string>(name: "roles.muted", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesrestrictedreaction = table.Column<string>(name: "roles.restricted-reaction", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesrestrictedembed = table.Column<string>(name: "roles.restricted-embed", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesrestrictedemoji = table.Column<string>(name: "roles.restricted-emoji", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesrestrictedattachment = table.Column<string>(name: "roles.restricted-attachment", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesrestrictedvoice = table.Column<string>(name: "roles.restricted-voice", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolespublic = table.Column<string[]>(name: "roles.public", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    rolesremoveinitial = table.Column<bool>(name: "roles.remove-initial", type: "boolean", nullable: false, defaultValueSql: "false"),
                    rolesdj = table.Column<string[]>(name: "roles.dj", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    rolessubscriber = table.Column<string>(name: "roles.subscriber", type: "character varying(19)", maxLength: 19, nullable: true),
                    rolesuniquerolesets = table.Column<string>(name: "roles.unique-role-sets", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    selfmodattachmentsenabled = table.Column<bool>(name: "selfmod.attachments.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodattachmentsignoredroles = table.Column<string[]>(name: "selfmod.attachments.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodattachmentsignoredchannels = table.Column<string[]>(name: "selfmod.attachments.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodattachmentssoftaction = table.Column<short>(name: "selfmod.attachments.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodattachmentshardaction = table.Column<short>(name: "selfmod.attachments.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodattachmentshardactionduration = table.Column<long>(name: "selfmod.attachments.hard-action-duration", type: "bigint", nullable: true),
                    selfmodattachmentsthresholdmaximum = table.Column<short>(name: "selfmod.attachments.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodattachmentsthresholdduration = table.Column<int>(name: "selfmod.attachments.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodcapitalsenabled = table.Column<bool>(name: "selfmod.capitals.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodcapitalsignoredroles = table.Column<string[]>(name: "selfmod.capitals.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodcapitalsignoredchannels = table.Column<string[]>(name: "selfmod.capitals.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodcapitalsminimum = table.Column<short>(name: "selfmod.capitals.minimum", type: "smallint", nullable: false, defaultValueSql: "15"),
                    selfmodcapitalsmaximum = table.Column<short>(name: "selfmod.capitals.maximum", type: "smallint", nullable: false, defaultValueSql: "50"),
                    selfmodcapitalssoftaction = table.Column<short>(name: "selfmod.capitals.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodcapitalshardaction = table.Column<short>(name: "selfmod.capitals.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodcapitalshardactionduration = table.Column<long>(name: "selfmod.capitals.hard-action-duration", type: "bigint", nullable: true),
                    selfmodcapitalsthresholdmaximum = table.Column<short>(name: "selfmod.capitals.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodcapitalsthresholdduration = table.Column<int>(name: "selfmod.capitals.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodlinksenabled = table.Column<bool>(name: "selfmod.links.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodlinksallowed = table.Column<string[]>(name: "selfmod.links.allowed", type: "character varying(128)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodlinksignoredroles = table.Column<string[]>(name: "selfmod.links.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodlinksignoredchannels = table.Column<string[]>(name: "selfmod.links.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodlinkssoftaction = table.Column<short>(name: "selfmod.links.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodlinkshardaction = table.Column<short>(name: "selfmod.links.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodlinkshardactionduration = table.Column<long>(name: "selfmod.links.hard-action-duration", type: "bigint", nullable: true),
                    selfmodlinksthresholdmaximum = table.Column<short>(name: "selfmod.links.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodlinksthresholdduration = table.Column<int>(name: "selfmod.links.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodmessagesenabled = table.Column<bool>(name: "selfmod.messages.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodmessagesignoredroles = table.Column<string[]>(name: "selfmod.messages.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodmessagesignoredchannels = table.Column<string[]>(name: "selfmod.messages.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodmessagesmaximum = table.Column<short>(name: "selfmod.messages.maximum", type: "smallint", nullable: false, defaultValueSql: "5"),
                    selfmodmessagesqueuesize = table.Column<short>(name: "selfmod.messages.queue-size", type: "smallint", nullable: false, defaultValueSql: "50"),
                    selfmodmessagessoftaction = table.Column<short>(name: "selfmod.messages.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodmessageshardaction = table.Column<short>(name: "selfmod.messages.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodmessageshardactionduration = table.Column<long>(name: "selfmod.messages.hard-action-duration", type: "bigint", nullable: true),
                    selfmodmessagesthresholdmaximum = table.Column<short>(name: "selfmod.messages.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodmessagesthresholdduration = table.Column<int>(name: "selfmod.messages.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodnewlinesenabled = table.Column<bool>(name: "selfmod.newlines.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodnewlinesignoredroles = table.Column<string[]>(name: "selfmod.newlines.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodnewlinesignoredchannels = table.Column<string[]>(name: "selfmod.newlines.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodnewlinesmaximum = table.Column<short>(name: "selfmod.newlines.maximum", type: "smallint", nullable: false, defaultValueSql: "20"),
                    selfmodnewlinessoftaction = table.Column<short>(name: "selfmod.newlines.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodnewlineshardaction = table.Column<short>(name: "selfmod.newlines.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodnewlineshardactionduration = table.Column<long>(name: "selfmod.newlines.hard-action-duration", type: "bigint", nullable: true),
                    selfmodnewlinesthresholdmaximum = table.Column<short>(name: "selfmod.newlines.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodnewlinesthresholdduration = table.Column<int>(name: "selfmod.newlines.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodinvitesenabled = table.Column<bool>(name: "selfmod.invites.enabled", type: "boolean", nullable: false, defaultValue: false),
                    selfmodinvitesignoredcodes = table.Column<string[]>(name: "selfmod.invites.ignored-codes", type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodinvitesignoredguilds = table.Column<string[]>(name: "selfmod.invites.ignored-guilds", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodinvitesignoredroles = table.Column<string[]>(name: "selfmod.invites.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodinvitesignoredchannels = table.Column<string[]>(name: "selfmod.invites.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodinvitessoftaction = table.Column<short>(name: "selfmod.invites.soft-action", type: "smallint", nullable: false, defaultValue: (short)0),
                    selfmodinviteshardaction = table.Column<short>(name: "selfmod.invites.hard-action", type: "smallint", nullable: false, defaultValue: (short)0),
                    selfmodinviteshardactionduration = table.Column<long>(name: "selfmod.invites.hard-action-duration", type: "bigint", nullable: true),
                    selfmodinvitesthresholdmaximum = table.Column<short>(name: "selfmod.invites.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodinvitesthresholdduration = table.Column<int>(name: "selfmod.invites.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodfilterenabled = table.Column<bool>(name: "selfmod.filter.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodfilterraw = table.Column<string[]>(name: "selfmod.filter.raw", type: "character varying(32)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodfilterignoredroles = table.Column<string[]>(name: "selfmod.filter.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodfilterignoredchannels = table.Column<string[]>(name: "selfmod.filter.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodfiltersoftaction = table.Column<short>(name: "selfmod.filter.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodfilterhardaction = table.Column<short>(name: "selfmod.filter.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodfilterhardactionduration = table.Column<long>(name: "selfmod.filter.hard-action-duration", type: "bigint", nullable: true),
                    selfmodfilterthresholdmaximum = table.Column<short>(name: "selfmod.filter.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodfilterthresholdduration = table.Column<int>(name: "selfmod.filter.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodreactionsenabled = table.Column<bool>(name: "selfmod.reactions.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    selfmodreactionsignoredroles = table.Column<string[]>(name: "selfmod.reactions.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodreactionsignoredchannels = table.Column<string[]>(name: "selfmod.reactions.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodreactionsmaximum = table.Column<short>(name: "selfmod.reactions.maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodreactionsallowed = table.Column<string[]>(name: "selfmod.reactions.allowed", type: "character varying(128)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodreactionsblocked = table.Column<string[]>(name: "selfmod.reactions.blocked", type: "character varying(128)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    selfmodreactionssoftaction = table.Column<short>(name: "selfmod.reactions.soft-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodreactionshardaction = table.Column<short>(name: "selfmod.reactions.hard-action", type: "smallint", nullable: false, defaultValueSql: "0"),
                    selfmodreactionshardactionduration = table.Column<long>(name: "selfmod.reactions.hard-action-duration", type: "bigint", nullable: true),
                    selfmodreactionsthresholdmaximum = table.Column<short>(name: "selfmod.reactions.threshold-maximum", type: "smallint", nullable: false, defaultValueSql: "10"),
                    selfmodreactionsthresholdduration = table.Column<int>(name: "selfmod.reactions.threshold-duration", type: "integer", nullable: false, defaultValueSql: "60000"),
                    selfmodignoredchannels = table.Column<string[]>(name: "selfmod.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    nomentionspamenabled = table.Column<bool>(name: "no-mention-spam.enabled", type: "boolean", nullable: false, defaultValueSql: "false"),
                    nomentionspamalerts = table.Column<bool>(name: "no-mention-spam.alerts", type: "boolean", nullable: false, defaultValueSql: "false"),
                    nomentionspammentionsallowed = table.Column<short>(name: "no-mention-spam.mentions-allowed", type: "smallint", nullable: false, defaultValueSql: "20"),
                    nomentionspamtimeperiod = table.Column<int>(name: "no-mention-spam.time-period", type: "integer", nullable: false, defaultValueSql: "8"),
                    socialenabled = table.Column<bool>(name: "social.enabled", type: "boolean", nullable: false, defaultValueSql: "true"),
                    socialachieve = table.Column<bool>(name: "social.achieve", type: "boolean", nullable: false, defaultValueSql: "false"),
                    socialachievemessage = table.Column<string>(name: "social.achieve-message", type: "character varying(2000)", maxLength: 2000, nullable: true),
                    socialmultiplier = table.Column<decimal>(name: "social.multiplier", type: "numeric(53)", precision: 53, nullable: false, defaultValueSql: "1"),
                    socialignoredchannels = table.Column<string[]>(name: "social.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    socialignoredroles = table.Column<string[]>(name: "social.ignored-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    starboardchannel = table.Column<string>(name: "starboard.channel", type: "character varying(19)", maxLength: 19, nullable: true),
                    starboardemoji = table.Column<string>(name: "starboard.emoji", type: "character varying(75)", maxLength: 75, nullable: false, defaultValueSql: "'%E2%AD%90'::character varying"),
                    starboardignoredchannels = table.Column<string[]>(name: "starboard.ignored-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    starboardminimum = table.Column<short>(name: "starboard.minimum", type: "smallint", nullable: false, defaultValueSql: "1"),
                    starboardselfstar = table.Column<bool>(name: "starboard.self-star", type: "boolean", nullable: false, defaultValueSql: "false"),
                    starboardmaximumage = table.Column<long>(name: "starboard.maximum-age", type: "bigint", nullable: true),
                    triggeralias = table.Column<string>(name: "trigger.alias", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    triggerincludes = table.Column<string>(name: "trigger.includes", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    musicdefaultvolume = table.Column<short>(name: "music.default-volume", type: "smallint", nullable: false, defaultValueSql: "100"),
                    musicmaximumduration = table.Column<int>(name: "music.maximum-duration", type: "integer", nullable: false, defaultValueSql: "7200000"),
                    musicmaximumentriesperuser = table.Column<short>(name: "music.maximum-entries-per-user", type: "smallint", nullable: false, defaultValueSql: "100"),
                    musicallowstreams = table.Column<bool>(name: "music.allow-streams", type: "boolean", nullable: false, defaultValueSql: "true"),
                    musicallowedvoicechannels = table.Column<string[]>(name: "music.allowed-voice-channels", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    musicallowedroles = table.Column<string[]>(name: "music.allowed-roles", type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    notificationsstreamstwitchstreamers = table.Column<string>(name: "notifications.streams.twitch.streamers", type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    suggestionsemojisupvote = table.Column<string>(name: "suggestions.emojis.upvote", type: "character varying(128)", maxLength: 128, nullable: false, defaultValueSql: "':ArrowT:694594285487652954'::character varying"),
                    suggestionsemojisdownvote = table.Column<string>(name: "suggestions.emojis.downvote", type: "character varying(128)", maxLength: 128, nullable: false, defaultValueSql: "':ArrowB:694594285269680179'::character varying"),
                    suggestionschannel = table.Column<string>(name: "suggestions.channel", type: "character varying(19)", maxLength: 19, nullable: true),
                    suggestionsonactiondm = table.Column<bool>(name: "suggestions.on-action.dm", type: "boolean", nullable: false, defaultValueSql: "false"),
                    suggestionsonactionrepost = table.Column<bool>(name: "suggestions.on-action.repost", type: "boolean", nullable: false, defaultValueSql: "false"),
                    suggestionsonactionhideauthor = table.Column<bool>(name: "suggestions.on-action.hide-author", type: "boolean", nullable: false, defaultValueSql: "false"),
                    eventsmemberusernameupdate = table.Column<bool>(name: "events.member-username-update", type: "boolean", nullable: false, defaultValueSql: "false"),
                    birthdaychannel = table.Column<string>(name: "birthday.channel", type: "character varying(19)", maxLength: 19, nullable: true),
                    birthdaymessage = table.Column<string>(name: "birthday.message", type: "character varying(200)", maxLength: 200, nullable: true),
                    birthdayrole = table.Column<string>(name: "birthday.role", type: "character varying(19)", maxLength: 19, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guilds", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "member",
                columns: table => new
                {
                    guild_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    points = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "0")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_923cd70108499f5f72ae286417c", x => new { x.guild_id, x.user_id });
                });

            migrationBuilder.CreateTable(
                name: "migrations",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    timestamp = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_migrations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "moderation",
                columns: table => new
                {
                    case_id = table.Column<int>(type: "integer", nullable: false),
                    guild_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    duration = table.Column<long>(type: "bigint", nullable: true),
                    extra_data = table.Column<string>(type: "json", nullable: true),
                    moderator_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false, defaultValueSql: "'365184854914236416'::character varying"),
                    reason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, defaultValueSql: "NULL::character varying"),
                    image_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, defaultValueSql: "NULL::character varying"),
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: true, defaultValueSql: "NULL::character varying"),
                    type = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_e9ec6c684894a7067a45b7ae4f6", x => new { x.case_id, x.guild_id });
                });

            migrationBuilder.CreateTable(
                name: "rpg_class",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    attack_multiplier = table.Column<double>(type: "double precision", nullable: false, defaultValueSql: "1"),
                    defense_multiplier = table.Column<double>(type: "double precision", nullable: false, defaultValueSql: "1"),
                    agility_multiplier = table.Column<double>(type: "double precision", nullable: false, defaultValueSql: "1"),
                    energy_multiplier = table.Column<double>(type: "double precision", nullable: false, defaultValueSql: "1"),
                    luck_multiplier = table.Column<double>(type: "double precision", nullable: false, defaultValueSql: "1")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_class", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rpg_guild",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    member_limit = table.Column<short>(type: "smallint", nullable: false, defaultValueSql: "5"),
                    win_count = table.Column<long>(type: "bigint", nullable: false),
                    lose_count = table.Column<long>(type: "bigint", nullable: false),
                    money_count = table.Column<long>(type: "bigint", nullable: false),
                    bank_limit = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "50000"),
                    upgrade = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_guild", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rpg_item",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    maximum_durability = table.Column<int>(type: "integer", nullable: false),
                    maximum_cooldown = table.Column<short>(type: "smallint", nullable: false),
                    attack = table.Column<double>(type: "double precision", nullable: false),
                    defense = table.Column<double>(type: "double precision", nullable: false),
                    health = table.Column<double>(type: "double precision", nullable: false),
                    required_energy = table.Column<double>(type: "double precision", nullable: false),
                    rarity = table.Column<int>(type: "integer", nullable: false),
                    accuracy = table.Column<short>(type: "smallint", nullable: false),
                    effects = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'{}'::jsonb")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_item", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "schedule",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    task_id = table.Column<string>(type: "character varying", nullable: false),
                    time = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    recurring = table.Column<string>(type: "character varying", nullable: true),
                    catch_up = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "true"),
                    data = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_schedule", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "starboard",
                columns: table => new
                {
                    message_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    guild_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    enabled = table.Column<bool>(type: "boolean", nullable: false),
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    channel_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    star_message_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: true),
                    stars = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_4bd6406cf1cf6cff7e9de1fafd2", x => new { x.message_id, x.guild_id });
                });

            migrationBuilder.CreateTable(
                name: "suggestion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    guild_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    message_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    author_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_5a7d999d79058230627a279853a", x => new { x.id, x.guild_id });
                });

            migrationBuilder.CreateTable(
                name: "twitch_stream_subscription",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    is_streaming = table.Column<bool>(type: "boolean", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    guild_ids = table.Column<string[]>(type: "character varying(19)[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_twitch_stream_subscription", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    points = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    reputations = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    moderation_dm = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "true"),
                    money = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "0")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rpg_guild_rank",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    guild_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_guild_rank", x => x.id);
                    table.ForeignKey(
                        name: "FK_ddc84b6edbf93fd59d9cc819bd0",
                        column: x => x.guild_id,
                        principalTable: "rpg_guild",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rpg_user_item",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    durability = table.Column<int>(type: "integer", nullable: false),
                    item_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_user_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_0babac6e86746fb7ab492f6d948",
                        column: x => x.item_id,
                        principalTable: "rpg_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_cooldown",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    daily = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    reputation = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_1950d1f438c5dfe9bc6b8cc3531", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_1950d1f438c5dfe9bc6b8cc3531",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_game_integration",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    game = table.Column<string>(type: "character varying(35)", maxLength: 35, nullable: false),
                    extra_data = table.Column<string>(type: "jsonb", nullable: false),
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_game_integration", x => x.id);
                    table.ForeignKey(
                        name: "FK_06e1223a9d5945e11f022e6a1c6",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_profile",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    banners = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    public_badges = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    badges = table.Column<string[]>(type: "character varying[]", nullable: false, defaultValueSql: "ARRAY[]::character varying[]"),
                    color = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    vault = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "0"),
                    banner_level = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false, defaultValueSql: "'1001'::character varying"),
                    banner_profile = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false, defaultValueSql: "'0001'::character varying"),
                    dark_theme = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "false")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_0468eeca19838d4337cb8f1ec93", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_0468eeca19838d4337cb8f1ec93",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_spouses_user",
                columns: table => new
                {
                    user_id_1 = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    user_id_2 = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_d03519ca87f9a551e7623625f17", x => new { x.user_id_1, x.user_id_2 });
                    table.ForeignKey(
                        name: "FK_039ee960316593d0e8102ae6c51",
                        column: x => x.user_id_2,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_6bbc6de75851eb64e17c07a6a94",
                        column: x => x.user_id_1,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rpg_user",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    name = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    win_count = table.Column<long>(type: "bigint", nullable: false),
                    death_count = table.Column<long>(type: "bigint", nullable: false),
                    crate_common_count = table.Column<int>(type: "integer", nullable: false),
                    crate_uncommon_count = table.Column<int>(type: "integer", nullable: false),
                    crate_rare_count = table.Column<int>(type: "integer", nullable: false),
                    crate_legendary_count = table.Column<int>(type: "integer", nullable: false),
                    attack = table.Column<int>(type: "integer", nullable: false),
                    health = table.Column<int>(type: "integer", nullable: false),
                    agility = table.Column<int>(type: "integer", nullable: false),
                    energy = table.Column<int>(type: "integer", nullable: false),
                    luck = table.Column<int>(type: "integer", nullable: false),
                    class_id = table.Column<int>(type: "integer", nullable: true),
                    equipped_item_id = table.Column<long>(type: "bigint", nullable: true),
                    guild_id = table.Column<int>(type: "integer", nullable: true),
                    guild_rank_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_719f657879066b0981260ccc7b2", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_6fd419cf9dad38d6b37c244b172",
                        column: x => x.guild_rank_id,
                        principalTable: "rpg_guild_rank",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_719f657879066b0981260ccc7b2",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_776e8e9d0df635e6be8b40c3507",
                        column: x => x.guild_id,
                        principalTable: "rpg_guild",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_a925752b2be93dab947e57f17b2",
                        column: x => x.class_id,
                        principalTable: "rpg_class",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_fdd476ddaed81357d7ddbdca883",
                        column: x => x.equipped_item_id,
                        principalTable: "rpg_user_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "rpg_battle",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    challenger_turn = table.Column<bool>(type: "boolean", nullable: false),
                    challenger_cooldown = table.Column<short>(type: "smallint", nullable: false),
                    challenger_health = table.Column<int>(type: "integer", nullable: false),
                    challenger_energy = table.Column<int>(type: "integer", nullable: false),
                    challenger_effects = table.Column<string>(type: "jsonb", nullable: false),
                    challenged_cooldown = table.Column<short>(type: "smallint", nullable: false),
                    challenged_health = table.Column<int>(type: "integer", nullable: false),
                    challenged_energy = table.Column<int>(type: "integer", nullable: false),
                    challenged_effects = table.Column<string>(type: "jsonb", nullable: false),
                    challenged_user = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    challenged_weapon_id = table.Column<long>(type: "bigint", nullable: true),
                    challenger_user = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    challenger_weapon_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rpg_battle", x => x.id);
                    table.ForeignKey(
                        name: "FK_36e1b3bf944502050aa76aa399a",
                        column: x => x.challenged_user,
                        principalTable: "rpg_user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_44cf95cf9e6634b2f87f8159477",
                        column: x => x.challenged_weapon_id,
                        principalTable: "rpg_user_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_5230797f292df6a36d1fb5f0f09",
                        column: x => x.challenger_user,
                        principalTable: "rpg_user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_e3997bc3dd2ed9164b7a1a85f02",
                        column: x => x.challenger_weapon_id,
                        principalTable: "rpg_user_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_rpg_battle_challenged_user",
                table: "rpg_battle",
                column: "challenged_user",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rpg_battle_challenged_weapon_id",
                table: "rpg_battle",
                column: "challenged_weapon_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_battle_challenger_user",
                table: "rpg_battle",
                column: "challenger_user",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rpg_battle_challenger_weapon_id",
                table: "rpg_battle",
                column: "challenger_weapon_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_class_name",
                table: "rpg_class",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rpg_guild_rank_guild_id",
                table: "rpg_guild_rank",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_item_name_rarity",
                table: "rpg_item",
                columns: new[] { "name", "rarity" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rpg_user_class_id",
                table: "rpg_user",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_user_equipped_item_id",
                table: "rpg_user",
                column: "equipped_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_user_guild_id",
                table: "rpg_user",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_user_guild_rank_id",
                table: "rpg_user",
                column: "guild_rank_id");

            migrationBuilder.CreateIndex(
                name: "ix_rpg_user_item_item_id",
                table: "rpg_user_item",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_game_integration_user_id",
                table: "user_game_integration",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_spouses_user_user_id_1",
                table: "user_spouses_user",
                column: "user_id_1");

            migrationBuilder.CreateIndex(
                name: "ix_user_spouses_user_user_id_2",
                table: "user_spouses_user",
                column: "user_id_2");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "banner");

            migrationBuilder.DropTable(
                name: "client");

            migrationBuilder.DropTable(
                name: "giveaway");

            migrationBuilder.DropTable(
                name: "guilds");

            migrationBuilder.DropTable(
                name: "member");

            migrationBuilder.DropTable(
                name: "migrations");

            migrationBuilder.DropTable(
                name: "moderation");

            migrationBuilder.DropTable(
                name: "rpg_battle");

            migrationBuilder.DropTable(
                name: "schedule");

            migrationBuilder.DropTable(
                name: "starboard");

            migrationBuilder.DropTable(
                name: "suggestion");

            migrationBuilder.DropTable(
                name: "twitch_stream_subscription");

            migrationBuilder.DropTable(
                name: "user_cooldown");

            migrationBuilder.DropTable(
                name: "user_game_integration");

            migrationBuilder.DropTable(
                name: "user_profile");

            migrationBuilder.DropTable(
                name: "user_spouses_user");

            migrationBuilder.DropTable(
                name: "rpg_user");

            migrationBuilder.DropTable(
                name: "rpg_guild_rank");

            migrationBuilder.DropTable(
                name: "user");

            migrationBuilder.DropTable(
                name: "rpg_class");

            migrationBuilder.DropTable(
                name: "rpg_user_item");

            migrationBuilder.DropTable(
                name: "rpg_guild");

            migrationBuilder.DropTable(
                name: "rpg_item");
        }
    }
}
