import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V40AddSocialIgnoredRoles1616188199786 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'social.ignored-roles',
				type: 'varchar',
				isArray: true,
				length: '19',
				default: 'ARRAY[]::VARCHAR[]'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'social.ignored-roles');
	}
}
