-- CreateEnum
CREATE TYPE "twitch_subscriptions_subscription_type_enum" AS ENUM ('stream.online', 'stream.offline');

-- CreateTable
CREATE TABLE "guilds" (
    "id" VARCHAR(19) NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "language" VARCHAR NOT NULL DEFAULT 'en-US',
    "disable-natural-prefix" BOOLEAN NOT NULL DEFAULT false,
    "disabled-commands" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "permissions.users" JSONB NOT NULL DEFAULT '[]',
    "permissions.roles" JSONB NOT NULL DEFAULT '[]',
    "channels.media-only" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "channels.logs.moderation" VARCHAR(19),
    "channels.logs.image" VARCHAR(19),
    "channels.logs.member-add" VARCHAR(19),
    "channels.logs.member-remove" VARCHAR(19),
    "channels.logs.member-nickname-update" VARCHAR(19),
    "channels.logs.member-username-update" VARCHAR(19),
    "channels.logs.member-roles-update" VARCHAR(19),
    "channels.logs.message-delete" VARCHAR(19),
    "channels.logs.message-delete-nsfw" VARCHAR(19),
    "channels.logs.message-update" VARCHAR(19),
    "channels.logs.message-update-nsfw" VARCHAR(19),
    "channels.logs.prune" VARCHAR(19),
    "channels.logs.reaction" VARCHAR(19),
    "channels.logs.role-create" VARCHAR(19),
    "channels.logs.role-update" VARCHAR(19),
    "channels.logs.role-delete" VARCHAR(19),
    "channels.logs.channel-create" VARCHAR(19),
    "channels.logs.channel-update" VARCHAR(19),
    "channels.logs.channel-delete" VARCHAR(19),
    "channels.logs.emoji-create" VARCHAR(19),
    "channels.logs.emoji-update" VARCHAR(19),
    "channels.logs.emoji-delete" VARCHAR(19),
    "channels.logs.server-update" VARCHAR(19),
    "channels.logs.voice-activity" VARCHAR(19),
    "channels.ignore.all" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "channels.ignore.message-edit" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "channels.ignore.message-delete" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "channels.ignore.reaction-add" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "command-auto-delete" JSONB NOT NULL DEFAULT '[]',
    "disabled-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "disabled-commands-channels" JSONB NOT NULL DEFAULT '[]',
    "events.ban-add" BOOLEAN NOT NULL DEFAULT false,
    "events.ban-remove" BOOLEAN NOT NULL DEFAULT false,
    "events.twemoji-reactions" BOOLEAN NOT NULL DEFAULT false,
    "messages.ignore-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "messages.moderation-dm" BOOLEAN NOT NULL DEFAULT false,
    "messages.moderation-reason-display" BOOLEAN NOT NULL DEFAULT true,
    "messages.moderation-message-display" BOOLEAN NOT NULL DEFAULT true,
    "messages.moderation-auto-delete" BOOLEAN NOT NULL DEFAULT false,
    "messages.moderator-name-display" BOOLEAN NOT NULL DEFAULT true,
    "messages.auto-delete.ignored-all" BOOLEAN NOT NULL DEFAULT false,
    "messages.auto-delete.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "messages.auto-delete.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "messages.auto-delete.ignored-commands" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "sticky-roles" JSONB NOT NULL DEFAULT '[]',
    "reaction-roles" JSONB NOT NULL DEFAULT '[]',
    "roles.admin" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "roles.initial" VARCHAR(19),
    "roles.initial-humans" VARCHAR(19),
    "roles.initial-bots" VARCHAR(19),
    "roles.moderator" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "roles.muted" VARCHAR(19),
    "roles.restricted-reaction" VARCHAR(19),
    "roles.restricted-embed" VARCHAR(19),
    "roles.restricted-emoji" VARCHAR(19),
    "roles.restricted-attachment" VARCHAR(19),
    "roles.restricted-voice" VARCHAR(19),
    "roles.public" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "roles.remove-initial" BOOLEAN NOT NULL DEFAULT false,
    "roles.unique-role-sets" JSONB NOT NULL DEFAULT '[]',
    "selfmod.attachments.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.attachments.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.attachments.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.attachments.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.attachments.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.attachments.hard-action-duration" BIGINT,
    "selfmod.attachments.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.attachments.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.capitals.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.capitals.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.capitals.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.capitals.minimum" SMALLINT NOT NULL DEFAULT 15,
    "selfmod.capitals.maximum" SMALLINT NOT NULL DEFAULT 50,
    "selfmod.capitals.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.capitals.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.capitals.hard-action-duration" BIGINT,
    "selfmod.capitals.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.capitals.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.links.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.links.allowed" VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR(128)[],
    "selfmod.links.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.links.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.links.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.links.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.links.hard-action-duration" BIGINT,
    "selfmod.links.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.links.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.messages.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.messages.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.messages.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.messages.maximum" SMALLINT NOT NULL DEFAULT 5,
    "selfmod.messages.queue-size" SMALLINT NOT NULL DEFAULT 50,
    "selfmod.messages.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.messages.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.messages.hard-action-duration" BIGINT,
    "selfmod.messages.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.messages.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.newlines.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.newlines.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.newlines.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.newlines.maximum" SMALLINT NOT NULL DEFAULT 20,
    "selfmod.newlines.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.newlines.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.newlines.hard-action-duration" BIGINT,
    "selfmod.newlines.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.newlines.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.invites.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.invites.ignored-codes" VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    "selfmod.invites.ignored-guilds" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.invites.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.invites.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.invites.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.invites.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.invites.hard-action-duration" BIGINT,
    "selfmod.invites.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.invites.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.filter.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.filter.raw" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "selfmod.filter.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.filter.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.filter.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.filter.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.filter.hard-action-duration" BIGINT,
    "selfmod.filter.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.filter.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.reactions.enabled" BOOLEAN NOT NULL DEFAULT false,
    "selfmod.reactions.ignored-roles" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.reactions.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "selfmod.reactions.maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.reactions.allowed" VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR(128)[],
    "selfmod.reactions.blocked" VARCHAR(128)[] DEFAULT ARRAY[]::VARCHAR(128)[],
    "selfmod.reactions.soft-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.reactions.hard-action" SMALLINT NOT NULL DEFAULT 0,
    "selfmod.reactions.hard-action-duration" BIGINT,
    "selfmod.reactions.threshold-maximum" SMALLINT NOT NULL DEFAULT 10,
    "selfmod.reactions.threshold-duration" INTEGER NOT NULL DEFAULT 60000,
    "selfmod.ignored-channels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "no-mention-spam.enabled" BOOLEAN NOT NULL DEFAULT false,
    "no-mention-spam.alerts" BOOLEAN NOT NULL DEFAULT false,
    "no-mention-spam.mentions-allowed" SMALLINT NOT NULL DEFAULT 20,
    "no-mention-spam.time-period" INTEGER NOT NULL DEFAULT 8,
    "events.unknown-messages" BOOLEAN NOT NULL DEFAULT false,
    "events.include-bots" BOOLEAN NOT NULL DEFAULT false,
    "channels.ignore.voice-activity" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "events.timeout" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PK_b9b5166d213705956363efc912e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_subscription" (
    "guild_id" VARCHAR(19) NOT NULL,
    "channel_id" VARCHAR(19) NOT NULL,
    "message" VARCHAR(200),
    "subscription_id" INTEGER NOT NULL,

    CONSTRAINT "PK_6fafe0fb6984c17b483ccd1a823" PRIMARY KEY ("guild_id","channel_id","subscription_id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_Migrations" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation" (
    "case_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6),
    "duration" BIGINT,
    "extra_data" JSON,
    "guild_id" VARCHAR(19) NOT NULL,
    "moderator_id" VARCHAR(19) NOT NULL,
    "reason" VARCHAR(2000),
    "image_url" VARCHAR(2000),
    "user_id" VARCHAR(19),
    "type" SMALLINT NOT NULL,
    "metadata" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "PK_e9ec6c684894a7067a45b7ae4f6" PRIMARY KEY ("case_id","guild_id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" SERIAL NOT NULL,
    "task_id" VARCHAR NOT NULL,
    "time" TIMESTAMP(6) NOT NULL,
    "recurring" VARCHAR,
    "catch_up" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,

    CONSTRAINT "PK_7ae10507a97b3a77d13d1a2bdd2" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitch_subscriptions" (
    "id" SERIAL NOT NULL,
    "streamer_id" VARCHAR(10) NOT NULL,
    "subscription_id" VARCHAR(36) NOT NULL,
    "subscriptionType" "twitch_subscriptions_subscription_type_enum" NOT NULL,

    CONSTRAINT "PK_0fd0f6c050ee4ccdce479c2b0e6" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(19) NOT NULL,
    "moderation_dm" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PK_03b91d2b8321aa7ba32257dc321" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IDX_690cc82abbfa67fc18db1c44e7" ON "twitch_subscriptions"("streamer_id", "subscriptionType");

-- AddForeignKey
ALTER TABLE "guild_subscription" ADD CONSTRAINT "FK_d88983e3c607b940f0c6e621dcf" FOREIGN KEY ("subscription_id") REFERENCES "twitch_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
