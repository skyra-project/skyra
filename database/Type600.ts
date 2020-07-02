import { MigrationInterface, QueryRunner } from 'typeorm';

export class Type600 implements MigrationInterface {

	public name = 'Type600';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */`CREATE TABLE "public"."banner" ("id" character varying(6) NOT NULL, "group" character varying(32) NOT NULL, "title" character varying(128) NOT NULL, "author_id" character varying(19) NOT NULL, "price" integer NOT NULL, CONSTRAINT "PK_30e92cf52f8f78aeea005c46f44" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."client" ("id" character varying(19) NOT NULL, "user_blocklist" character varying array NOT NULL DEFAULT ARRAY[]::VARCHAR[], "user_boost" character varying array NOT NULL DEFAULT ARRAY[]::VARCHAR[], "guild_blocklist" character varying array NOT NULL DEFAULT ARRAY[]::VARCHAR[], "guild_boost" character varying array NOT NULL DEFAULT ARRAY[]::VARCHAR[], "schedules" text[] NOT NULL DEFAULT ARRAY []::json[], CONSTRAINT "PK_1d7f977dce904d4ffd68ce226bb" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."command_counter" ("id" character varying(32) NOT NULL, "uses" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_eda3fdbfdcd21f06a6146cea130" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."dashboard_user" ("id" character varying(19) NOT NULL, "access_token" character(30) NOT NULL, "refresh_token" character(30) NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_e4f0810ebeb1dd63fd7ac94c22f" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."giveaway" ("title" character varying(256) NOT NULL, "ends_at" TIMESTAMP NOT NULL, "guild_id" character varying(19) NOT NULL, "channel_id" character varying(19) NOT NULL, "message_id" character varying(19) NOT NULL, "minimum" integer NOT NULL DEFAULT 1, "minimum_winners" integer NOT NULL DEFAULT 1, CONSTRAINT "PK_e73020907ca2a4b1ae14fce6e74" PRIMARY KEY ("guild_id", "message_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."member" ("guild_id" character varying(19) NOT NULL, "user_id" character varying(19) NOT NULL, "points" bigint NOT NULL DEFAULT 0, CONSTRAINT "PK_923cd70108499f5f72ae286417c" PRIMARY KEY ("guild_id", "user_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."moderation" ("case_id" integer NOT NULL, "created_at" TIMESTAMP, "duration" integer, "extra_data" json, "guild_id" character varying(19) NOT NULL, "moderator_id" character varying(19), "reason" character varying(2000), "image_url" character varying(2000), "user_id" character varying(19), "type" smallint NOT NULL, CONSTRAINT "PK_e9ec6c684894a7067a45b7ae4f6" PRIMARY KEY ("case_id", "guild_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_class" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "attack_multiplier" double precision NOT NULL DEFAULT 1.0, "defense_multiplier" double precision NOT NULL DEFAULT 1.0, "agility_multiplier" double precision NOT NULL DEFAULT 1.0, "energy_multiplier" double precision NOT NULL DEFAULT 1.0, "luck_multiplier" double precision NOT NULL DEFAULT 1.0, CONSTRAINT "UQ_c21506119f763eff259ec4a91cd" UNIQUE ("name"), CONSTRAINT "PK_d20d284fafcb52cbf746bd337f0" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_guild_rank" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_c9a023a1e05297a18b40907b2b3" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_guild" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(200), "member_limit" smallint NOT NULL DEFAULT 5, "win_count" bigint NOT NULL DEFAULT 0, "lose_count" bigint NOT NULL DEFAULT 0, "money_count" bigint NOT NULL DEFAULT 0, "bank_limit" bigint NOT NULL DEFAULT 50000, "upgrade" smallint NOT NULL, CONSTRAINT "PK_39925ff4b5855ee47a49602f654" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TYPE "public"."rpg_item_type_enum" AS ENUM('Weapon', 'Shield', 'Disposable', 'Special')`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_item" ("id" SERIAL NOT NULL, "type" "public"."rpg_item_type_enum" NOT NULL DEFAULT 'Weapon', "name" character varying(50) NOT NULL, "maximum_durability" integer NOT NULL, "maximum_cooldown" smallint NOT NULL DEFAULT 0, "attack" double precision NOT NULL DEFAULT 0.0, "defense" double precision NOT NULL DEFAULT 0.0, "health" double precision NOT NULL DEFAULT 0.0, "required_energy" double precision NOT NULL DEFAULT 0.0, "rarity" integer NOT NULL, "accuracy" smallint NOT NULL DEFAULT 100, "effects" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_860aeca7b7317100a7caed7aaab" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE UNIQUE INDEX "rpg_item_name_rarity_key" ON "public"."rpg_item" ("name", "rarity") `);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_user_item" ("id" BIGSERIAL NOT NULL, "durability" bigint NOT NULL, "item_id" integer, CONSTRAINT "PK_a0805d9a7830c7aa28fdff0636c" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."user_profile" ("banners" character varying array NOT NULL DEFAULT '{}'::varchar(6)[], "public_badges" character varying array NOT NULL DEFAULT '{}'::varchar(6)[], "badges" character varying array NOT NULL DEFAULT '{}'::varchar(6)[], "color" integer NOT NULL DEFAULT 0, "vault" bigint NOT NULL DEFAULT 0, "banner_level" character varying(6) NOT NULL DEFAULT '1001', "banner_profile" character varying(6) NOT NULL DEFAULT '0001', "dark_theme" boolean NOT NULL DEFAULT false, "user_id" character varying(19) NOT NULL, CONSTRAINT "REL_0468eeca19838d4337cb8f1ec9" UNIQUE ("user_id"), CONSTRAINT "PK_0468eeca19838d4337cb8f1ec93" PRIMARY KEY ("user_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."user_cooldown" ("daily" TIMESTAMP, "reputation" TIMESTAMP, "user_id" character varying(19) NOT NULL, CONSTRAINT "REL_1950d1f438c5dfe9bc6b8cc353" UNIQUE ("user_id"), CONSTRAINT "PK_1950d1f438c5dfe9bc6b8cc3531" PRIMARY KEY ("user_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."user" ("id" character varying(19) NOT NULL, "points" integer NOT NULL DEFAULT 0, "reputations" integer NOT NULL DEFAULT 0, "moderation_dm" boolean NOT NULL DEFAULT true, "money" bigint NOT NULL DEFAULT 0, CONSTRAINT "PK_03b91d2b8321aa7ba32257dc321" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_user" ("name" character varying(32) NOT NULL, "win_count" bigint NOT NULL DEFAULT 0, "death_count" bigint NOT NULL DEFAULT 0, "crate_common_count" integer NOT NULL DEFAULT 0, "crate_uncommon_count" integer NOT NULL DEFAULT 0, "crate_rare_count" integer NOT NULL DEFAULT 0, "crate_legendary_count" integer NOT NULL DEFAULT 0, "attack" integer NOT NULL, "health" integer NOT NULL, "agility" integer NOT NULL, "energy" integer NOT NULL, "luck" integer NOT NULL, "class_id" integer, "equipped_item_id" bigint, "guild_id" integer, "guild_rank_id" integer, "user_id" character varying(19) NOT NULL, CONSTRAINT "REL_719f657879066b0981260ccc7b" UNIQUE ("user_id"), CONSTRAINT "PK_719f657879066b0981260ccc7b2" PRIMARY KEY ("user_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."rpg_battle" ("id" BIGSERIAL NOT NULL, "challenger_turn" boolean NOT NULL, "challenger_cooldown" smallint NOT NULL DEFAULT 0, "challenger_health" integer NOT NULL, "challenger_energy" integer NOT NULL, "challenger_effects" jsonb NOT NULL DEFAULT '{}', "challenged_cooldown" smallint NOT NULL DEFAULT 0, "challenged_health" integer NOT NULL, "challenged_energy" integer NOT NULL, "challenged_effects" jsonb NOT NULL DEFAULT '{}', "challenged_user" character varying(19), "challenged_weapon_id" bigint, "challenger_user" character varying(19), "challenger_weapon_id" bigint, CONSTRAINT "REL_36e1b3bf944502050aa76aa399" UNIQUE ("challenged_user"), CONSTRAINT "REL_5230797f292df6a36d1fb5f0f0" UNIQUE ("challenger_user"), CONSTRAINT "PK_ea33db14ae66cf5ceea0643f059" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."schedule" ("id" SERIAL NOT NULL, "task_id" character varying NOT NULL, "time" TIMESTAMP NOT NULL, "recurring" character varying, "catch_up" boolean NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_7ae10507a97b3a77d13d1a2bdd2" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."starboard" ("enabled" boolean NOT NULL, "user_id" character varying(19) NOT NULL, "message_id" character varying(19) NOT NULL, "channel_id" character varying(19) NOT NULL, "guild_id" character varying(19) NOT NULL, "star_message_id" character varying(19), "stars" integer NOT NULL, CONSTRAINT "PK_4bd6406cf1cf6cff7e9de1fafd2" PRIMARY KEY ("message_id", "guild_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."suggestion" ("id" integer NOT NULL, "guild_id" character varying(19) NOT NULL, "message_id" character varying(19) NOT NULL, "author_id" character varying(19) NOT NULL, CONSTRAINT "PK_5a7d999d79058230627a279853a" PRIMARY KEY ("id", "guild_id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."twitch_stream_subscription" ("id" character varying(16) NOT NULL, "is_streaming" boolean NOT NULL, "expires_at" TIMESTAMP NOT NULL, "guild_ids" character varying array NOT NULL DEFAULT ARRAY[]::VARCHAR[], CONSTRAINT "PK_c5beca4ad070c7a99e3fe1cf06e" PRIMARY KEY ("id"))`);
		await queryRunner.query(/* sql */`CREATE TABLE "public"."user_spouses_user" ("user_id_1" character varying(19) NOT NULL, "user_id_2" character varying(19) NOT NULL, CONSTRAINT "PK_d03519ca87f9a551e7623625f17" PRIMARY KEY ("user_id_1", "user_id_2"))`);
		await queryRunner.query(/* sql */`CREATE INDEX "IDX_6bbc6de75851eb64e17c07a6a9" ON "public"."user_spouses_user" ("user_id_1") `);
		await queryRunner.query(/* sql */`CREATE INDEX "IDX_039ee960316593d0e8102ae6c5" ON "public"."user_spouses_user" ("user_id_2") `);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user_item" ADD CONSTRAINT "FK_0babac6e86746fb7ab492f6d948" FOREIGN KEY ("item_id") REFERENCES "public"."rpg_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_profile" ADD CONSTRAINT "FK_0468eeca19838d4337cb8f1ec93" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_cooldown" ADD CONSTRAINT "FK_1950d1f438c5dfe9bc6b8cc3531" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" ADD CONSTRAINT "FK_a925752b2be93dab947e57f17b2" FOREIGN KEY ("class_id") REFERENCES "public"."rpg_class"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" ADD CONSTRAINT "FK_fdd476ddaed81357d7ddbdca883" FOREIGN KEY ("equipped_item_id") REFERENCES "public"."rpg_user_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" ADD CONSTRAINT "FK_776e8e9d0df635e6be8b40c3507" FOREIGN KEY ("guild_id") REFERENCES "public"."rpg_guild"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" ADD CONSTRAINT "FK_6fd419cf9dad38d6b37c244b172" FOREIGN KEY ("guild_rank_id") REFERENCES "public"."rpg_guild_rank"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" ADD CONSTRAINT "FK_719f657879066b0981260ccc7b2" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" ADD CONSTRAINT "FK_36e1b3bf944502050aa76aa399a" FOREIGN KEY ("challenged_user") REFERENCES "public"."rpg_user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" ADD CONSTRAINT "FK_44cf95cf9e6634b2f87f8159477" FOREIGN KEY ("challenged_weapon_id") REFERENCES "public"."rpg_user_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" ADD CONSTRAINT "FK_5230797f292df6a36d1fb5f0f09" FOREIGN KEY ("challenger_user") REFERENCES "public"."rpg_user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" ADD CONSTRAINT "FK_e3997bc3dd2ed9164b7a1a85f02" FOREIGN KEY ("challenger_weapon_id") REFERENCES "public"."rpg_user_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_spouses_user" ADD CONSTRAINT "FK_6bbc6de75851eb64e17c07a6a94" FOREIGN KEY ("user_id_1") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_spouses_user" ADD CONSTRAINT "FK_039ee960316593d0e8102ae6c51" FOREIGN KEY ("user_id_2") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_spouses_user" DROP CONSTRAINT "FK_039ee960316593d0e8102ae6c51"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_spouses_user" DROP CONSTRAINT "FK_6bbc6de75851eb64e17c07a6a94"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" DROP CONSTRAINT "FK_e3997bc3dd2ed9164b7a1a85f02"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" DROP CONSTRAINT "FK_5230797f292df6a36d1fb5f0f09"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" DROP CONSTRAINT "FK_44cf95cf9e6634b2f87f8159477"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_battle" DROP CONSTRAINT "FK_36e1b3bf944502050aa76aa399a"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" DROP CONSTRAINT "FK_719f657879066b0981260ccc7b2"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" DROP CONSTRAINT "FK_6fd419cf9dad38d6b37c244b172"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" DROP CONSTRAINT "FK_776e8e9d0df635e6be8b40c3507"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" DROP CONSTRAINT "FK_fdd476ddaed81357d7ddbdca883"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user" DROP CONSTRAINT "FK_a925752b2be93dab947e57f17b2"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_cooldown" DROP CONSTRAINT "FK_1950d1f438c5dfe9bc6b8cc3531"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."user_profile" DROP CONSTRAINT "FK_0468eeca19838d4337cb8f1ec93"`);
		await queryRunner.query(/* sql */`ALTER TABLE "public"."rpg_user_item" DROP CONSTRAINT "FK_0babac6e86746fb7ab492f6d948"`);
		await queryRunner.query(/* sql */`DROP INDEX "public"."IDX_039ee960316593d0e8102ae6c5"`);
		await queryRunner.query(/* sql */`DROP INDEX "public"."IDX_6bbc6de75851eb64e17c07a6a9"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."user_spouses_user"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."twitch_stream_subscription"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."suggestion"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."starboard"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."schedule"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_battle"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_user"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."user"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."user_cooldown"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."user_profile"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_user_item"`);
		await queryRunner.query(/* sql */`DROP INDEX "public"."rpg_item_name_rarity_key"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_item"`);
		await queryRunner.query(/* sql */`DROP TYPE "public"."rpg_item_type_enum"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_guild"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_guild_rank"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."rpg_class"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."moderation"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."member"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."giveaway"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."dashboard_user"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."command_counter"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."client"`);
		await queryRunner.query(/* sql */`DROP TABLE "public"."banner"`);
	}

}
