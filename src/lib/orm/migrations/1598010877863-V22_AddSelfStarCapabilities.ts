import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class V22AddSelfStarCapabilities1598010877863 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'suggestions.selfStar',
				type: 'boolean',
				default: false
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'suggestions.selfStar');
	}
}
