import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V58GiveawayAuthor1633201003755 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('giveaway', new TableColumn({ name: 'author_id', type: 'varchar', length: '19', isNullable: true }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('giveaway', 'author_id');
	}
}
