import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V42AddAllowedRolesIntoGiveaways1616201639503 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'giveaway',
			new TableColumn({
				name: 'allowed_roles',
				type: 'varchar',
				isArray: true,
				length: '19',
				default: 'ARRAY[]::VARCHAR[]'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('giveaway', 'allowed_roles');
	}
}
