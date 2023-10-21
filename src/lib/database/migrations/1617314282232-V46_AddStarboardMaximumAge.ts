import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V46AddStarboardMaximumAge1617314282232 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.maximum-age', type: 'bigint', isNullable: true }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'starboard.maximum-age');
	}
}
