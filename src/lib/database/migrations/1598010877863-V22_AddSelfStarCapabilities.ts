import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V22AddSelfStarCapabilities1598010877863 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'starboard.selfStar',
				type: 'boolean',
				default: false
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'starboard.selfStar');
	}
}
