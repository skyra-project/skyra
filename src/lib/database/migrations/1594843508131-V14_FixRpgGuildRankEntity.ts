import { TableColumn, TableForeignKey, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V14FixRpgGuildRankEntity1594843508131 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'rpg_guild_rank',
			new TableColumn({
				name: 'guild_id',
				type: 'integer'
			})
		);

		await queryRunner.createForeignKey(
			'rpg_guild_rank',
			new TableForeignKey({
				columnNames: ['guild_id'],
				referencedTableName: 'rpg_guild',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('rpg_guild_rank', 'guild_id');
	}
}
