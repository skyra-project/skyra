import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V48AddSeparateInitialRoles1617890802896 implements MigrationInterface {
	private readonly keys = ['roles.initial-humans', 'roles.initial-bots'];
	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.keys) {
			await queryRunner.addColumn(
				'guilds',
				new TableColumn({
					name: key,
					type: 'varchar',
					length: '19',
					isNullable: true
				})
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.keys) {
			await queryRunner.dropColumn('guilds', key);
		}
	}
}
