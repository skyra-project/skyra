import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V53AfkSettings1620050724729 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.role', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.prefix', type: 'varchar', length: '32', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.prefix-force', type: 'boolean', default: false }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'afk.role');
		await queryRunner.dropColumn('guilds', 'afk.prefix');
		await queryRunner.dropColumn('guilds', 'afk.prefix-force');
	}
}
