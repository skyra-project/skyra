BEGIN TRANSACTION;

CREATE TYPE public.rpg_item_type_enum AS ENUM (
    'Weapon',
    'Shield',
    'Disposable',
    'Special'
);

ALTER TYPE public.rpg_item_type_enum OWNER TO postgres;

CREATE FUNCTION public.jsonb_array_to_jsonb(jsonb[]) RETURNS jsonb
    LANGUAGE sql
    AS $_$
			SELECT to_jsonb($1)
			$_$;

ALTER FUNCTION public.jsonb_array_to_jsonb(jsonb[]) OWNER TO postgres;

CREATE FUNCTION public.tc_column_size(table_name character varying, column_name character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
    declare response BIGINT;
BEGIN
    EXECUTE 'select sum(pg_column_size(t."' || column_name || '")) from "' || table_name || '" t ' into response;
    return response;
END;
$$;

ALTER FUNCTION public.tc_column_size(table_name character varying, column_name character varying) OWNER TO postgres;
SET default_tablespace = '';
SET default_table_access_method = heap;

CREATE TABLE public.banner (
    id character varying(6) NOT NULL,
    "group" character varying(32) NOT NULL,
    title character varying(128) NOT NULL,
    author_id character varying(19) NOT NULL,
    price integer NOT NULL
);

ALTER TABLE public.banner OWNER TO postgres;

CREATE TABLE public.client (
    id character varying(19) DEFAULT '266624760782258186'::character varying NOT NULL,
    user_blocklist character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    user_boost character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    guild_blocklist character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    guild_boost character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL
);

ALTER TABLE public.client OWNER TO postgres;

CREATE TABLE public.giveaway (
    title character varying(256) NOT NULL,
    guild_id character varying(19) NOT NULL,
    channel_id character varying(19) NOT NULL,
    message_id character varying(19) NOT NULL,
    minimum integer DEFAULT 1 NOT NULL,
    minimum_winners integer DEFAULT 1 NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    allowed_roles character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL
);

ALTER TABLE public.giveaway OWNER TO postgres;

CREATE TABLE public.guilds (
    id character varying(19) NOT NULL,
    prefix character varying(10) DEFAULT 's!'::character varying NOT NULL,
    language character varying DEFAULT 'en-US'::character varying NOT NULL,
    "disable-natural-prefix" boolean DEFAULT false NOT NULL,
    "disabled-commands" character varying(32)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "custom-commands" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "permissions.users" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "permissions.roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "channels.announcements" character varying(19),
    "channels.greeting" character varying(19),
    "channels.farewell" character varying(19),
    "channels.logs.moderation" character varying(19),
    "channels.logs.image" character varying(19),
    "channels.spam" character varying(19),
    "command-auto-delete" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "disabled-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "disabled-commands-channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "events.ban-add" boolean DEFAULT false NOT NULL,
    "events.ban-remove" boolean DEFAULT false NOT NULL,
    "messages.farewell" character varying(2000),
    "messages.greeting" character varying(2000),
    "messages.join-dm" character varying(1500),
    "messages.ignore-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "sticky-roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "roles.admin" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "roles.auto" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "roles.initial" character varying(19),
    "roles.moderator" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "roles.muted" character varying(19),
    "roles.public" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "roles.remove-initial" boolean DEFAULT false NOT NULL,
    "roles.dj" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "roles.subscriber" character varying(19),
    "roles.unique-role-sets" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "selfmod.attachments.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.attachments.threshold-maximum" smallint DEFAULT 20 NOT NULL,
    "selfmod.attachments.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.attachments.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.attachments.hard-action-duration" bigint,
    "selfmod.capitals.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.capitals.minimum" smallint DEFAULT 15 NOT NULL,
    "selfmod.capitals.maximum" smallint DEFAULT 50 NOT NULL,
    "selfmod.capitals.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.capitals.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.capitals.hard-action-duration" bigint,
    "selfmod.capitals.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.capitals.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.newlines.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.newlines.maximum" smallint DEFAULT 20 NOT NULL,
    "selfmod.newlines.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.newlines.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.newlines.hard-action-duration" bigint,
    "selfmod.newlines.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.newlines.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.invites.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.invites.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.invites.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.invites.hard-action-duration" bigint,
    "selfmod.invites.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.invites.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.filter.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.filter.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.filter.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.filter.hard-action-duration" bigint,
    "selfmod.filter.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.filter.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.filter.raw" character varying(32)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "no-mention-spam.enabled" boolean DEFAULT false NOT NULL,
    "no-mention-spam.alerts" boolean DEFAULT false NOT NULL,
    "no-mention-spam.mentions-allowed" smallint DEFAULT 20 NOT NULL,
    "no-mention-spam.time-period" integer DEFAULT 8 NOT NULL,
    "social.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "starboard.channel" character varying(19),
    "starboard.emoji" character varying(75) DEFAULT '%E2%AD%90'::character varying NOT NULL,
    "starboard.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "starboard.minimum" smallint DEFAULT 1 NOT NULL,
    "trigger.alias" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "trigger.includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "messages.moderation-dm" boolean DEFAULT false NOT NULL,
    "messages.moderator-name-display" boolean DEFAULT true NOT NULL,
    "roles.restricted-reaction" character varying(19),
    "roles.restricted-embed" character varying(19),
    "roles.restricted-attachment" character varying(19),
    "roles.restricted-voice" character varying(19),
    "messages.moderation-reason-display" boolean DEFAULT true NOT NULL,
    "messages.moderation-auto-delete" boolean DEFAULT false NOT NULL,
    "selfmod.messages.maximum" smallint DEFAULT 5 NOT NULL,
    "selfmod.messages.queue-size" smallint DEFAULT 50 NOT NULL,
    "selfmod.messages.threshold-maximum" integer DEFAULT 10 NOT NULL,
    "selfmod.messages.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.messages.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.messages.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.messages.hard-action-duration" bigint,
    "selfmod.messages.soft-action" smallint DEFAULT 0 NOT NULL,
    "messages.moderation-message-display" boolean DEFAULT true NOT NULL,
    "events.twemoji-reactions" boolean DEFAULT false NOT NULL,
    "selfmod.reactions.maximum" smallint DEFAULT 10 NOT NULL,
    "channels.logs.prune" character varying(19),
    "selfmod.reactions.blocked" character varying(128)[] DEFAULT '{}'::character varying[] NOT NULL,
    "selfmod.reactions.allowed" character varying(128)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.reactions.enabled" boolean DEFAULT false NOT NULL,
    "channels.logs.reaction" character varying(19),
    "selfmod.reactions.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.reactions.hard-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.reactions.hard-action-duration" bigint,
    "selfmod.reactions.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.reactions.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "selfmod.links.allowed" character varying(128)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.links.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.links.enabled" boolean DEFAULT false NOT NULL,
    "selfmod.links.hard-action-duration" bigint,
    "selfmod.links.threshold-maximum" smallint DEFAULT 10 NOT NULL,
    "selfmod.links.hard-action" integer DEFAULT 0 NOT NULL,
    "selfmod.links.threshold-duration" integer DEFAULT 60000 NOT NULL,
    "notifications.streams.twitch.streamers" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "selfmod.links.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.messages.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.messages.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.newlines.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.capitals.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.newlines.ignored-channels" character varying(19)[] DEFAULT '{}'::character varying[] NOT NULL,
    "selfmod.links.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.capitals.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.invites.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.reactions.ignored-roles" character varying(19)[] DEFAULT '{}'::character varying[] NOT NULL,
    "selfmod.filter.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.filter.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.reactions.ignored-channels" character varying(19)[] DEFAULT '{}'::character varying[] NOT NULL,
    "selfmod.invites.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "music.maximum-entries-per-user" smallint DEFAULT 100 NOT NULL,
    "music.allow-streams" boolean DEFAULT true NOT NULL,
    "music.maximum-duration" integer DEFAULT 7200000 NOT NULL,
    "music.default-volume" smallint DEFAULT 100 NOT NULL,
    "social.multiplier" numeric(53,0) DEFAULT 1 NOT NULL,
    "social.enabled" boolean DEFAULT true NOT NULL,
    "messages.announcement-embed" boolean DEFAULT false NOT NULL,
    "selfmod.invites.ignored-guilds" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.invites.ignored-codes" character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "suggestions.on-action.hide-author" boolean DEFAULT false NOT NULL,
    "suggestions.on-action.repost" boolean DEFAULT false NOT NULL,
    "suggestions.on-action.dm" boolean DEFAULT false NOT NULL,
    "suggestions.emojis.downvote" character varying(128) DEFAULT ':ArrowB:694594285269680179'::character varying NOT NULL,
    "suggestions.channel" character varying(19),
    "roles.restricted-emoji" character varying(19),
    "suggestions.emojis.upvote" character varying(128) DEFAULT ':ArrowT:694594285487652954'::character varying NOT NULL,
    "channels.ignore.message-delete" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "channels.ignore.message-edit" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "channels.ignore.reaction-add" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "reaction-roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "channels.ignore.all" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "starboard.self-star" boolean DEFAULT false NOT NULL,
    "selfmod.attachments.soft-action" smallint DEFAULT 0 NOT NULL,
    "selfmod.attachments.ignored-roles" character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "selfmod.attachments.ignored-channels" character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "birthday.channel" character varying(19),
    "birthday.message" character varying(200),
    "birthday.role" character varying(19),
    "social.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "music.allowed-voice-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "music.allowed-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "messages.auto-delete.ignored-all" boolean DEFAULT false NOT NULL,
    "messages.auto-delete.ignored-roles" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "messages.auto-delete.ignored-channels" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "messages.auto-delete.ignored-commands" character varying(32)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    "starboard.maximum-age" bigint,
    "channels.logs.role-create" character varying(19),
    "channels.logs.role-update" character varying(19),
    "channels.logs.role-delete" character varying(19),
    "channels.logs.channel-create" character varying(19),
    "channels.logs.channel-update" character varying(19),
    "channels.logs.channel-delete" character varying(19),
    "channels.logs.emoji-create" character varying(19),
    "channels.logs.emoji-update" character varying(19),
    "channels.logs.emoji-delete" character varying(19),
    "channels.logs.server-update" character varying(19),
    "roles.initial-humans" character varying(19),
    "roles.initial-bots" character varying(19),
    "social.achieve-role" character varying,
    "social.achieve-level" character varying,
    "social.achieve-channel" character varying(19),
    "social.achieve-multiple" smallint DEFAULT 1 NOT NULL,
    "messages.farewell-auto-delete" bigint,
    "messages.greeting-auto-delete" bigint,
    "afk.role" character varying(19),
    "afk.prefix" character varying(32),
    "afk.prefix-force" boolean DEFAULT false NOT NULL,
    "channels.logs.member-add" character varying(19),
    "channels.logs.member-remove" character varying(19),
    "channels.logs.member-nickname-update" character varying(19),
    "channels.logs.member-username-update" character varying(19),
    "channels.logs.member-roles-update" character varying(19),
    "channels.logs.message-delete" character varying(19),
    "channels.logs.message-delete-nsfw" character varying(19),
    "channels.logs.message-update" character varying(19),
    "channels.logs.message-update-nsfw" character varying(19),
    "channels.media-only" character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL
);

ALTER TABLE public.guilds OWNER TO postgres;

CREATE TABLE public.member (
    guild_id character varying(19) NOT NULL,
    user_id character varying(19) NOT NULL,
    points bigint DEFAULT 0 NOT NULL
);

ALTER TABLE public.member OWNER TO postgres;

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);

ALTER TABLE public.migrations OWNER TO postgres;

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.migrations_id_seq OWNER TO postgres;

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;

CREATE TABLE public.moderation (
    case_id integer NOT NULL,
    duration bigint,
    extra_data json,
    guild_id character varying(19) NOT NULL,
    moderator_id character varying(19) DEFAULT '${CLIENT_ID}'::character varying NOT NULL,
    reason character varying(2000),
    user_id character varying(19),
    type smallint NOT NULL,
    image_url character varying(2000),
    created_at timestamp without time zone
);

ALTER TABLE public.moderation OWNER TO postgres;

CREATE TABLE public.rpg_battle (
    id bigint NOT NULL,
    challenger_turn boolean NOT NULL,
    challenger_cooldown smallint NOT NULL,
    challenger_health integer NOT NULL,
    challenger_energy integer NOT NULL,
    challenger_effects jsonb NOT NULL,
    challenged_cooldown smallint NOT NULL,
    challenged_health integer NOT NULL,
    challenged_energy integer NOT NULL,
    challenged_effects jsonb NOT NULL,
    challenged_user character varying(19) NOT NULL,
    challenged_weapon_id bigint,
    challenger_user character varying(19) NOT NULL,
    challenger_weapon_id bigint,
    CONSTRAINT "CHK_760060b13b49578c5793dd14a1" CHECK ((challenger_cooldown >= 0)),
    CONSTRAINT "CHK_ab2faa6798fea9fe447135b4cf" CHECK ((challenged_cooldown >= 0)),
    CONSTRAINT "CHK_b9ad7c44bdb22d6141618bc1e5" CHECK ((challenged_energy >= 0)),
    CONSTRAINT "CHK_c85db79cdd662f00254be0779a" CHECK ((challenger_energy >= 0)),
    CONSTRAINT "CHK_d699e64c8408ffbe62ba88727c" CHECK ((challenger_health >= 0)),
    CONSTRAINT "CHK_f879b2a05a54a993fb5e4fefc2" CHECK ((challenged_health >= 0))
);

ALTER TABLE public.rpg_battle OWNER TO postgres;

CREATE SEQUENCE public.rpg_battle_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_battle_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_battle_id_seq OWNED BY public.rpg_battle.id;

CREATE TABLE public.rpg_class (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    attack_multiplier double precision DEFAULT 1 NOT NULL,
    defense_multiplier double precision DEFAULT 1 NOT NULL,
    agility_multiplier double precision DEFAULT 1 NOT NULL,
    energy_multiplier double precision DEFAULT 1 NOT NULL,
    luck_multiplier double precision DEFAULT 1 NOT NULL,
    CONSTRAINT "CHK_3614a83420a0771931faa64216" CHECK ((agility_multiplier >= (0)::double precision)),
    CONSTRAINT "CHK_66492284eb6bf50080a913d888" CHECK ((energy_multiplier >= (0)::double precision)),
    CONSTRAINT "CHK_86e6f32dcf51dfdd1d61016056" CHECK (((name)::text <> ''::text)),
    CONSTRAINT "CHK_bc5a8cbb424816e3f9746ef96c" CHECK ((attack_multiplier >= (0)::double precision)),
    CONSTRAINT "CHK_c4a240fc35a174df9d1ec87626" CHECK ((defense_multiplier >= (0)::double precision)),
    CONSTRAINT "CHK_f0ac0ee2bf2f49f7d5e9cd223c" CHECK ((luck_multiplier >= (0)::double precision))
);

ALTER TABLE public.rpg_class OWNER TO postgres;

CREATE SEQUENCE public.rpg_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_class_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_class_id_seq OWNED BY public.rpg_class.id;

CREATE TABLE public.rpg_guild (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    member_limit smallint DEFAULT 5 NOT NULL,
    win_count smallint DEFAULT 0 NOT NULL,
    lose_count smallint DEFAULT 0 NOT NULL,
    money_count smallint DEFAULT 0 NOT NULL,
    bank_limit smallint DEFAULT 50000 NOT NULL,
    upgrade smallint DEFAULT 0 NOT NULL,
    CONSTRAINT "CHK_305defbd9bd7a147e5b4a537f3" CHECK ((upgrade >= 0)),
    CONSTRAINT "CHK_42f1a13e4835fa9dd28be1423c" CHECK ((money_count >= 0)),
    CONSTRAINT "CHK_5f5692daa6fff242f73f2dd096" CHECK ((win_count >= 0)),
    CONSTRAINT "CHK_9eb458d836ebdf34927bfd1803" CHECK ((lose_count >= 0)),
    CONSTRAINT "CHK_ecaf9c7702bd35499e408381c8" CHECK ((member_limit >= 5)),
    CONSTRAINT "CHK_f46902789451fec5271ca08b53" CHECK ((bank_limit >= 0))
);

ALTER TABLE public.rpg_guild OWNER TO postgres;

CREATE SEQUENCE public.rpg_guild_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_guild_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_guild_id_seq OWNED BY public.rpg_guild.id;

CREATE TABLE public.rpg_guild_rank (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    guild_id integer NOT NULL,
    CONSTRAINT "CHK_e4f8d1a4654286a139f5ed566e" CHECK (((name)::text <> ''::text))
);

ALTER TABLE public.rpg_guild_rank OWNER TO postgres;

CREATE SEQUENCE public.rpg_guild_rank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_guild_rank_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_guild_rank_id_seq OWNED BY public.rpg_guild_rank.id;

CREATE TABLE public.rpg_item (
    id integer NOT NULL,
    type public.rpg_item_type_enum NOT NULL,
    name character varying(50) NOT NULL,
    maximum_durability integer NOT NULL,
    maximum_cooldown smallint NOT NULL,
    attack double precision NOT NULL,
    defense double precision NOT NULL,
    health double precision NOT NULL,
    required_energy double precision NOT NULL,
    rarity integer NOT NULL,
    accuracy smallint NOT NULL,
    effects jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT "CHK_073e74b495c0bcfa11720724fa" CHECK ((attack >= (0)::double precision)),
    CONSTRAINT "CHK_139528ddbb49696056c35ab7c2" CHECK ((required_energy >= (0)::double precision)),
    CONSTRAINT "CHK_21ddedbdde6b359a707fb30b78" CHECK ((rarity >= 1)),
    CONSTRAINT "CHK_305a52fdaa6c5ae02249276f52" CHECK ((defense >= (0)::double precision)),
    CONSTRAINT "CHK_309f10ea36f249025a83280679" CHECK (((name)::text <> ''::text)),
    CONSTRAINT "CHK_434dd430ebbcd7f14d8c86d562" CHECK ((accuracy <= 100)),
    CONSTRAINT "CHK_6cd528fd18c9ee2d79b8bf0496" CHECK ((health >= (0)::double precision)),
    CONSTRAINT "CHK_80af11a86ab8d3af5ce5a759b7" CHECK ((maximum_cooldown >= 0)),
    CONSTRAINT "CHK_aa16a170a67aa7e74cf5ae2a4b" CHECK ((accuracy >= 0)),
    CONSTRAINT "CHK_ca57f4d0561bd309b3632391d7" CHECK ((maximum_durability >= 0))
);

ALTER TABLE public.rpg_item OWNER TO postgres;

CREATE SEQUENCE public.rpg_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_item_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_item_id_seq OWNED BY public.rpg_item.id;

CREATE TABLE public.rpg_user (
    name character varying(32) NOT NULL,
    win_count bigint DEFAULT 0 NOT NULL,
    death_count bigint DEFAULT 0 NOT NULL,
    crate_common_count integer DEFAULT 0 NOT NULL,
    crate_uncommon_count integer DEFAULT 0 NOT NULL,
    crate_rare_count integer DEFAULT 0 NOT NULL,
    crate_legendary_count integer DEFAULT 0 NOT NULL,
    attack integer NOT NULL,
    health integer NOT NULL,
    agility integer NOT NULL,
    energy integer NOT NULL,
    luck integer NOT NULL,
    class_id integer,
    equipped_item_id bigint,
    guild_id integer,
    guild_rank_id integer,
    user_id character varying(19) NOT NULL,
    CONSTRAINT "CHK_0b196c91b16156497a04a20eb8" CHECK ((energy >= 0)),
    CONSTRAINT "CHK_2f8318aca333e4b8a81d2a76b5" CHECK ((luck >= 0)),
    CONSTRAINT "CHK_33acdcf3aed2d0fa8b6064ce23" CHECK ((crate_uncommon_count >= 0)),
    CONSTRAINT "CHK_49eeefe855a2f50c639b37a3b9" CHECK ((crate_common_count >= 0)),
    CONSTRAINT "CHK_7b726e0f67fb74fa8e8227d29b" CHECK ((crate_rare_count >= 0)),
    CONSTRAINT "CHK_b8829558f038e5343f4e8209f4" CHECK ((crate_legendary_count >= 0)),
    CONSTRAINT "CHK_c27af07041459afc9cc1ce7000" CHECK ((health >= 1)),
    CONSTRAINT "CHK_cc02319c115481afab0e2aef7f" CHECK ((death_count >= 0)),
    CONSTRAINT "CHK_d2ff9b4fced90b3db088b98bb9" CHECK ((win_count >= 0)),
    CONSTRAINT "CHK_e947d5538d4e8496e61b1e39cc" CHECK ((agility >= 1)),
    CONSTRAINT "CHK_f2ff6e5fe4d4df4c839e275358" CHECK ((attack >= 1))
);

ALTER TABLE public.rpg_user OWNER TO postgres;

CREATE TABLE public.rpg_user_item (
    id bigint NOT NULL,
    durability integer NOT NULL,
    item_id integer NOT NULL,
    CONSTRAINT "CHK_fbe90726e8d649fad5ac26342d" CHECK ((durability >= 0))
);

ALTER TABLE public.rpg_user_item OWNER TO postgres;

CREATE SEQUENCE public.rpg_user_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.rpg_user_item_id_seq OWNER TO postgres;

ALTER SEQUENCE public.rpg_user_item_id_seq OWNED BY public.rpg_user_item.id;

CREATE TABLE public.schedule (
    id integer NOT NULL,
    task_id character varying NOT NULL,
    "time" timestamp without time zone NOT NULL,
    recurring character varying,
    catch_up boolean DEFAULT true NOT NULL,
    data jsonb NOT NULL
);

ALTER TABLE public.schedule OWNER TO postgres;

CREATE SEQUENCE public.schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.schedule_id_seq OWNER TO postgres;

ALTER SEQUENCE public.schedule_id_seq OWNED BY public.schedule.id;

CREATE TABLE public.starboard (
    enabled boolean NOT NULL,
    user_id character varying(19) NOT NULL,
    message_id character varying(19) NOT NULL,
    channel_id character varying(19) NOT NULL,
    guild_id character varying(19) NOT NULL,
    star_message_id character varying(19),
    stars integer NOT NULL
);

ALTER TABLE public.starboard OWNER TO postgres;

CREATE TABLE public.suggestion (
    message_id character varying(19) NOT NULL,
    id integer NOT NULL,
    guild_id character varying(19) NOT NULL,
    author_id character varying(19) NOT NULL
);

ALTER TABLE public.suggestion OWNER TO postgres;

CREATE TABLE public.twitch_stream_subscription (
    id character varying(16) NOT NULL,
    is_streaming boolean NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    guild_ids character varying(19)[] DEFAULT ARRAY[]::character varying[] NOT NULL
);

ALTER TABLE public.twitch_stream_subscription OWNER TO postgres;

CREATE TABLE public."user" (
    id character varying(19) NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    reputations integer DEFAULT 0 NOT NULL,
    moderation_dm boolean DEFAULT true NOT NULL,
    money bigint DEFAULT 0 NOT NULL
);

ALTER TABLE public."user" OWNER TO postgres;

CREATE TABLE public.user_cooldown (
    user_id character varying(19) NOT NULL,
    daily timestamp without time zone,
    reputation timestamp without time zone
);

ALTER TABLE public.user_cooldown OWNER TO postgres;

CREATE TABLE public.user_game_integration (
    user_id character varying(19) NOT NULL,
    id integer NOT NULL,
    game character varying(35) NOT NULL,
    extra_data jsonb NOT NULL
);

ALTER TABLE public.user_game_integration OWNER TO postgres;

CREATE SEQUENCE public.user_game_integration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.user_game_integration_id_seq OWNER TO postgres;

ALTER SEQUENCE public.user_game_integration_id_seq OWNED BY public.user_game_integration.id;

CREATE TABLE public.user_profile (
    user_id character varying(19) NOT NULL,
    banners character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    public_badges character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    badges character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    color integer DEFAULT 0 NOT NULL,
    vault bigint DEFAULT 0 NOT NULL,
    banner_level character varying DEFAULT 1001 NOT NULL,
    banner_profile character varying DEFAULT 1 NOT NULL,
    dark_theme boolean DEFAULT false NOT NULL
);

ALTER TABLE public.user_profile OWNER TO postgres;

CREATE TABLE public.user_spouses_user (
    user_id_1 character varying(19) NOT NULL,
    user_id_2 character varying(19) NOT NULL
);

ALTER TABLE public.user_spouses_user OWNER TO postgres;

CREATE TABLE public.users (
    id character varying(19) NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_battle ALTER COLUMN id SET DEFAULT nextval('public.rpg_battle_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_class ALTER COLUMN id SET DEFAULT nextval('public.rpg_class_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_guild ALTER COLUMN id SET DEFAULT nextval('public.rpg_guild_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_guild_rank ALTER COLUMN id SET DEFAULT nextval('public.rpg_guild_rank_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_item ALTER COLUMN id SET DEFAULT nextval('public.rpg_item_id_seq'::regclass);

ALTER TABLE ONLY public.rpg_user_item ALTER COLUMN id SET DEFAULT nextval('public.rpg_user_item_id_seq'::regclass);

ALTER TABLE ONLY public.schedule ALTER COLUMN id SET DEFAULT nextval('public.schedule_id_seq'::regclass);

ALTER TABLE ONLY public.user_game_integration ALTER COLUMN id SET DEFAULT nextval('public.user_game_integration_id_seq'::regclass);

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_class
    ADD CONSTRAINT "PK_24176671ac3db25d2d974dceb69" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_item
    ADD CONSTRAINT "PK_32f4a5194cc33d4b6cf348db574" PRIMARY KEY (id);

ALTER TABLE ONLY public.twitch_stream_subscription
    ADD CONSTRAINT "PK_3df70660c846eee12fde44e4170" PRIMARY KEY (id);

ALTER TABLE ONLY public.user_spouses_user
    ADD CONSTRAINT "PK_4f23db9862a4ef730fdc95802aa" PRIMARY KEY (user_id_1, user_id_2);

ALTER TABLE ONLY public.user_game_integration
    ADD CONSTRAINT "PK_6c7c5aec2c2c2b057ed41f52ccc" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_guild
    ADD CONSTRAINT "PK_82b769d03000b1d5daf08eec444" PRIMARY KEY (id);

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);

ALTER TABLE ONLY public.client
    ADD CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_guild_rank
    ADD CONSTRAINT "PK_ba2d60c0cf889f28e5ae75bbfb6" PRIMARY KEY (id);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "PK_dc46ddf34f2940c84fee110d62e" PRIMARY KEY (user_id);

ALTER TABLE ONLY public.user_cooldown
    ADD CONSTRAINT "PK_e2d6df31cb819fadd78941fa5cf" PRIMARY KEY (user_id);

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT "PK_eee360f3bff24af1b6890765201" PRIMARY KEY (user_id);

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "PK_f57abcdcd87b756913b84b0437f" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_user_item
    ADD CONSTRAINT "PK_fdca4cfe4c38afa83d498e57465" PRIMARY KEY (id);

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "UQ_5cb6499ecdd5888f729c66cdefb" UNIQUE (challenger_user);

ALTER TABLE ONLY public.rpg_class
    ADD CONSTRAINT "UQ_6a4d1b683bda7c9bc8831f2d5c1" UNIQUE (name);

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "UQ_f959925ede2f4da5348888da1ab" UNIQUE (challenged_user);

ALTER TABLE ONLY public.banner
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.giveaway
    ADD CONSTRAINT giveaway_guild_message_idx PRIMARY KEY (guild_id, message_id);

ALTER TABLE ONLY public.guilds
    ADD CONSTRAINT guilds_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.member
    ADD CONSTRAINT members_guild_user_idx PRIMARY KEY (guild_id, user_id);

ALTER TABLE ONLY public.moderation
    ADD CONSTRAINT moderation_guild_case_idx PRIMARY KEY (guild_id, case_id);

ALTER TABLE ONLY public.starboard
    ADD CONSTRAINT starboard_guild_message_idx PRIMARY KEY (guild_id, message_id);

ALTER TABLE ONLY public.suggestion
    ADD CONSTRAINT suggestion_guild_id_idx PRIMARY KEY (guild_id, id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX "IDX_5daed66be579a54865ddf6fce4" ON public.rpg_item USING btree (name, rarity);

CREATE INDEX "IDX_90094e20f2eece2acaa77d9084" ON public.member USING btree (points DESC);

ALTER TABLE ONLY public.rpg_guild_rank
    ADD CONSTRAINT "FK_0d67c7a04ebcc4ca86de9569cf3" FOREIGN KEY (guild_id) REFERENCES public.rpg_guild(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_user_item
    ADD CONSTRAINT "FK_1d5caa4d9925514c65f90ab002c" FOREIGN KEY (item_id) REFERENCES public.rpg_item(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "FK_2eb7461c634bd421375f74440f6" FOREIGN KEY (class_id) REFERENCES public.rpg_class(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "FK_5cb6499ecdd5888f729c66cdefb" FOREIGN KEY (challenger_user) REFERENCES public.rpg_user(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_spouses_user
    ADD CONSTRAINT "FK_95d03249af11a98d5c5a85a0435" FOREIGN KEY (user_id_2) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "FK_9989cbf0e12372f1a951b8579da" FOREIGN KEY (guild_id) REFERENCES public.rpg_guild(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "FK_c5fcfef1452b22eaab9b5ba3177" FOREIGN KEY (challenged_weapon_id) REFERENCES public.rpg_user_item(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.user_spouses_user
    ADD CONSTRAINT "FK_c97cee77dcdd9a0ecfef86958b4" FOREIGN KEY (user_id_1) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "FK_dc46ddf34f2940c84fee110d62e" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_cooldown
    ADD CONSTRAINT "FK_e2d6df31cb819fadd78941fa5cf" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_game_integration
    ADD CONSTRAINT "FK_e6e813f00a4f7c1dcea605a8f66" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT "FK_eee360f3bff24af1b6890765201" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "FK_f5c4170bf6644d5893b0e9a2116" FOREIGN KEY (guild_rank_id) REFERENCES public.rpg_guild_rank(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.rpg_user
    ADD CONSTRAINT "FK_f848af9c84de5c7c627aa6826a1" FOREIGN KEY (equipped_item_id) REFERENCES public.rpg_user_item(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "FK_f959925ede2f4da5348888da1ab" FOREIGN KEY (challenged_user) REFERENCES public.rpg_user(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rpg_battle
    ADD CONSTRAINT "FK_ff75068e156f91033170c0c4ec5" FOREIGN KEY (challenger_weapon_id) REFERENCES public.rpg_user_item(id) ON DELETE SET NULL;

INSERT INTO public.guilds (id, prefix, language, "notifications.streams.twitch.streamers") VALUES ('541738403230777351', 'dr!', 'en-GB', '[["148662609", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494934754, "gamesBlacklist": [], "gamesWhitelist": []}, {"author": "268792781713965056", "status": 1, "channel": "648213337628475392", "message": "Kyra has gone offline, say goodbye everyone 👋 !", "createdAt": 1589495016195, "gamesBlacklist": [], "gamesWhitelist": []}]], ["24138907", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494944097, "gamesBlacklist": [], "gamesWhitelist": []}]], ["22025290", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494954166, "gamesBlacklist": [], "gamesWhitelist": []}]], ["40980097", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494959430, "gamesBlacklist": [], "gamesWhitelist": []}]], ["27107346", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494965656, "gamesBlacklist": [], "gamesWhitelist": []}]], ["41684297", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494972635, "gamesBlacklist": [], "gamesWhitelist": []}]], ["42297570", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494979190, "gamesBlacklist": [], "gamesWhitelist": []}]], ["51496027", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494986737, "gamesBlacklist": [], "gamesWhitelist": []}]], ["48660027", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589494995259, "gamesBlacklist": [], "gamesWhitelist": []}]], ["53172552", [{"author": "268792781713965056", "status": 0, "channel": "648213337628475392", "message": "", "createdAt": 1589569775577, "gamesBlacklist": [], "gamesWhitelist": []}]]]');

INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('24138907', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('27107346', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('42297570', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('148662609', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('41684297', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('53172552', false, '2021-08-26 00:00:08.619000', '{116606129714233350,541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('51496027', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('48660027', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('22025290', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');
INSERT INTO public.twitch_stream_subscription (id, is_streaming, expires_at, guild_ids) VALUES ('40980097', false, '2021-08-26 00:00:08.619000', '{541738403230777351}');

COMMIT;