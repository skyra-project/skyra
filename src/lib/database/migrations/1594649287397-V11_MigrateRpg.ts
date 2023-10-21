import { Table, TableCheck, TableColumn, TableForeignKey, TableIndex, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V11MigrateRpg1594649287397 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Drops all tables
		await queryRunner.query(/* sql */ `DROP TABLE rpg_users CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_guilds CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_guild_rank CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_items CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_user_items CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_battles CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_class CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TYPE rpg_item_type;`);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_class',
				checks: [
					new TableCheck({ expression: /* sql */ `name <> ''` }),
					new TableCheck({ expression: /* sql */ `attack_multiplier >= 0` }),
					new TableCheck({ expression: /* sql */ `defense_multiplier >= 0` }),
					new TableCheck({ expression: /* sql */ `agility_multiplier >= 0` }),
					new TableCheck({ expression: /* sql */ `energy_multiplier >= 0` }),
					new TableCheck({ expression: /* sql */ `luck_multiplier >= 0` })
				],
				columns: [
					new TableColumn({ name: 'id', type: 'integer', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'name', type: 'varchar', length: '20', isUnique: true, isNullable: false }),
					new TableColumn({ name: 'attack_multiplier', type: 'double precision', isNullable: false, default: 1.0 }),
					new TableColumn({ name: 'defense_multiplier', type: 'double precision', isNullable: false, default: 1.0 }),
					new TableColumn({ name: 'agility_multiplier', type: 'double precision', isNullable: false, default: 1.0 }),
					new TableColumn({ name: 'energy_multiplier', type: 'double precision', isNullable: false, default: 1.0 }),
					new TableColumn({ name: 'luck_multiplier', type: 'double precision', isNullable: false, default: 1.0 })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_guild_rank',
				checks: [new TableCheck({ expression: /* sql */ `name <> ''` })],
				columns: [
					new TableColumn({ name: 'id', type: 'integer', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'name', type: 'varchar', length: '50', isNullable: false })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_guild',
				checks: [
					new TableCheck({ expression: /* sql */ `member_limit >= 5` }),
					new TableCheck({ expression: /* sql */ `win_count >= 0` }),
					new TableCheck({ expression: /* sql */ `lose_count >= 0` }),
					new TableCheck({ expression: /* sql */ `money_count >= 0` }),
					new TableCheck({ expression: /* sql */ `bank_limit >= 0` }),
					new TableCheck({ expression: /* sql */ `upgrade >= 0` })
				],
				columns: [
					new TableColumn({ name: 'id', type: 'integer', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'name', type: 'varchar', length: '50', isNullable: false }),
					new TableColumn({ name: 'description', type: 'varchar', length: '200', isNullable: true }),
					new TableColumn({ name: 'member_limit', type: 'smallint', isNullable: false, default: 5 }),
					new TableColumn({ name: 'win_count', type: 'smallint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'lose_count', type: 'smallint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'money_count', type: 'smallint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'bank_limit', type: 'smallint', isNullable: false, default: 50000 }),
					new TableColumn({ name: 'upgrade', type: 'smallint', isNullable: false, default: 0 })
				]
			})
		);

		await queryRunner.query(/* sql */ `CREATE TYPE "public"."rpg_item_type_enum" AS ENUM('Weapon', 'Shield', 'Disposable', 'Special');`);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_item',
				checks: [
					new TableCheck({ expression: /* sql */ `name <> ''` }),
					new TableCheck({ expression: /* sql */ `maximum_durability >= 0` }),
					new TableCheck({ expression: /* sql */ `maximum_cooldown >= 0` }),
					new TableCheck({ expression: /* sql */ `attack >= 0` }),
					new TableCheck({ expression: /* sql */ `defense >= 0` }),
					new TableCheck({ expression: /* sql */ `health >= 0` }),
					new TableCheck({ expression: /* sql */ `required_energy >= 0` }),
					new TableCheck({ expression: /* sql */ `rarity >= 1` }),
					new TableCheck({ expression: /* sql */ `accuracy >= 0` }),
					new TableCheck({ expression: /* sql */ `accuracy <= 100` })
				],
				indices: [new TableIndex({ columnNames: ['name', 'rarity'], isUnique: true })],
				columns: [
					new TableColumn({ name: 'id', type: 'integer', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'type', type: 'rpg_item_type_enum', isNullable: false }),
					new TableColumn({ name: 'name', type: 'varchar', length: '50', isNullable: false }),
					new TableColumn({ name: 'maximum_durability', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'maximum_cooldown', type: 'smallint', isNullable: false }),
					new TableColumn({ name: 'attack', type: 'double precision', isNullable: false }),
					new TableColumn({ name: 'defense', type: 'double precision', isNullable: false }),
					new TableColumn({ name: 'health', type: 'double precision', isNullable: false }),
					new TableColumn({ name: 'required_energy', type: 'double precision', isNullable: false }),
					new TableColumn({ name: 'rarity', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'accuracy', type: 'smallint', isNullable: false }),
					new TableColumn({ name: 'effects', type: 'jsonb', default: "'{}'::jsonb" })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_user_item',
				checks: [new TableCheck({ expression: /* sql */ `"durability" >= 0` })],
				columns: [
					new TableColumn({ name: 'id', type: 'bigint', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'durability', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'item_id', type: 'integer', isNullable: false })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_user',
				checks: [
					new TableCheck({ expression: /* sql */ `win_count >= 0` }),
					new TableCheck({ expression: /* sql */ `death_count >= 0` }),
					new TableCheck({ expression: /* sql */ `crate_common_count >= 0` }),
					new TableCheck({ expression: /* sql */ `crate_uncommon_count >= 0` }),
					new TableCheck({ expression: /* sql */ `crate_rare_count >= 0` }),
					new TableCheck({ expression: /* sql */ `crate_legendary_count >= 0` }),
					new TableCheck({ expression: /* sql */ `attack >= 1` }),
					new TableCheck({ expression: /* sql */ `health >= 1` }),
					new TableCheck({ expression: /* sql */ `agility >= 1` }),
					new TableCheck({ expression: /* sql */ `energy >= 0` }),
					new TableCheck({ expression: /* sql */ `luck >= 0` })
				],
				columns: [
					new TableColumn({ name: 'name', type: 'character varying', length: '32', isNullable: false }),
					new TableColumn({ name: 'win_count', type: 'bigint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'death_count', type: 'bigint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'crate_common_count', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'crate_uncommon_count', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'crate_rare_count', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'crate_legendary_count', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'attack', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'health', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'agility', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'energy', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'luck', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'class_id', type: 'integer', isNullable: true }),
					new TableColumn({ name: 'equipped_item_id', type: 'bigint', isNullable: true }),
					new TableColumn({ name: 'guild_id', type: 'integer', isNullable: true }),
					new TableColumn({ name: 'guild_rank_id', type: 'integer', isNullable: true }),
					new TableColumn({ name: 'user_id', type: 'character varying', length: '19', isNullable: false, isPrimary: true })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'rpg_battle',
				checks: [
					new TableCheck({ expression: /* sql */ `challenger_cooldown >= 0` }),
					new TableCheck({ expression: /* sql */ `challenger_health >= 0` }),
					new TableCheck({ expression: /* sql */ `challenger_energy >= 0` }),
					new TableCheck({ expression: /* sql */ `challenged_cooldown >= 0` }),
					new TableCheck({ expression: /* sql */ `challenged_health >= 0` }),
					new TableCheck({ expression: /* sql */ `challenged_energy >= 0` })
				],
				columns: [
					new TableColumn({ name: 'id', type: 'bigint', isGenerated: true, isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'challenger_turn', type: 'boolean', isNullable: false }),
					new TableColumn({ name: 'challenger_cooldown', type: 'smallint', isNullable: false }),
					new TableColumn({ name: 'challenger_health', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'challenger_energy', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'challenger_effects', type: 'jsonb', isNullable: false }),
					new TableColumn({ name: 'challenged_cooldown', type: 'smallint', isNullable: false }),
					new TableColumn({ name: 'challenged_health', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'challenged_energy', type: 'integer', isNullable: false }),
					new TableColumn({ name: 'challenged_effects', type: 'jsonb', isNullable: false }),
					new TableColumn({ name: 'challenged_user', type: 'character varying', length: '19', isNullable: false, isUnique: true }),
					new TableColumn({ name: 'challenged_weapon_id', type: 'bigint', isNullable: true }),
					new TableColumn({ name: 'challenger_user', type: 'character varying', length: '19', isNullable: false, isUnique: true }),
					new TableColumn({ name: 'challenger_weapon_id', type: 'bigint', isNullable: true })
				]
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user_item',
			new TableForeignKey({
				columnNames: ['item_id'],
				referencedTableName: 'rpg_item',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user',
			new TableForeignKey({
				columnNames: ['class_id'],
				referencedTableName: 'rpg_class',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user',
			new TableForeignKey({
				columnNames: ['equipped_item_id'],
				referencedTableName: 'rpg_user_item',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user',
			new TableForeignKey({
				columnNames: ['guild_id'],
				referencedTableName: 'rpg_guild',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user',
			new TableForeignKey({
				columnNames: ['guild_rank_id'],
				referencedTableName: 'rpg_guild_rank',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_user',
			new TableForeignKey({
				columnNames: ['user_id'],
				referencedTableName: 'user',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_battle',
			new TableForeignKey({
				columnNames: ['challenged_user'],
				referencedTableName: 'rpg_user',
				referencedColumnNames: ['user_id'],
				onDelete: 'CASCADE',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_battle',
			new TableForeignKey({
				columnNames: ['challenged_weapon_id'],
				referencedTableName: 'rpg_user_item',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_battle',
			new TableForeignKey({
				columnNames: ['challenger_user'],
				referencedTableName: 'rpg_user',
				referencedColumnNames: ['user_id'],
				onDelete: 'CASCADE',
				onUpdate: 'NO ACTION'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_battle',
			new TableForeignKey({
				columnNames: ['challenger_weapon_id'],
				referencedTableName: 'rpg_user_item',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL',
				onUpdate: 'NO ACTION'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drops all tables
		await queryRunner.query(/* sql */ `DROP TABLE rpg_user CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_guild CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_guild_rank CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_item CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_user_item CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_battle CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE rpg_class CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TYPE rpg_item_type_enum;`);
	}
}
