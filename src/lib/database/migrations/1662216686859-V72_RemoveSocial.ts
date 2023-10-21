import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V72RemoveSocial1662216686859 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Guild settings:
		await queryRunner.dropColumn('guilds', 'roles.auto');
		await queryRunner.dropColumn('guilds', 'social.enabled');
		await queryRunner.dropColumn('guilds', 'social.achieve-role');
		await queryRunner.dropColumn('guilds', 'social.achieve-level');
		await queryRunner.dropColumn('guilds', 'social.achieve-channel');
		await queryRunner.dropColumn('guilds', 'social.achieve-multiple');
		await queryRunner.dropColumn('guilds', 'social.multiplier');
		await queryRunner.dropColumn('guilds', 'social.ignored-channels');
		await queryRunner.dropColumn('guilds', 'social.ignored-roles');

		// User social settings:
		await queryRunner.dropColumn('user', 'points');
		await queryRunner.dropColumn('user', 'reputations');
		await queryRunner.dropColumn('user', 'money');

		// Social tables:
		await queryRunner.dropTable('user_profile');
		await queryRunner.dropTable('user_cooldown');
		await queryRunner.dropTable('member');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Guild settings:
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'roles.auto', type: 'jsonb', default: "'[]'::JSONB" }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.enabled', type: 'boolean', default: 'true' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-role', type: 'varchar', isNullable: true, length: '19' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-level', type: 'varchar', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-channel', type: 'varchar', isNullable: true, length: '19' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-multiple', type: 'smallint', default: '1' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.multiplier', type: 'numeric', default: '1', precision: 53 }));
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'social.ignored-channels', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'social.ignored-roles', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);

		// User social settings:
		await queryRunner.addColumn('user', new TableColumn({ name: 'points', type: 'integer', default: '0' }));
		await queryRunner.addColumn('user', new TableColumn({ name: 'reputations', type: 'integer', default: '0' }));
		await queryRunner.addColumn('user', new TableColumn({ name: 'money', type: 'bigint', default: '0' }));

		// Social tables:
		await queryRunner.createTable(
			new Table({
				name: 'user_profile',
				columns: [
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'banners', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'public_badges', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'badges', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'color', type: 'integer', default: '0' }),
					new TableColumn({ name: 'vault', type: 'bigint', default: '0' }),
					new TableColumn({ name: 'banner_level', type: 'varchar', default: '1001' }),
					new TableColumn({ name: 'banner_profile', type: 'varchar', default: '1' }),
					new TableColumn({ name: 'dark_theme', type: 'boolean', default: 'false' })
				],
				foreignKeys: [{ columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] }]
			})
		);
		await queryRunner.createTable(
			new Table({
				name: 'user_cooldown',
				columns: [
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'daily', type: 'timestamp' }),
					new TableColumn({ name: 'reputation', type: 'timestamp' })
				],
				foreignKeys: [{ columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] }]
			})
		);
		await queryRunner.createTable(
			new Table({
				name: 'member',
				columns: [
					new TableColumn({ name: 'guild_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'points', type: 'bigint', default: '0' })
				]
			})
		);
	}
}
