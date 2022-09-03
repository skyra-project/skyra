import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class V71RemoveRpg1662215310736 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('rpg_battle');
		await queryRunner.dropTable('rpg_class');
		await queryRunner.dropTable('rpg_guild');
		await queryRunner.dropTable('rpg_guild_rank');
		await queryRunner.dropTable('rpg_item');
		await queryRunner.dropTable('rpg_user');
		await queryRunner.dropTable('rpg_user_item');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(new Table({ name: 'rpg_battle' }));
		await queryRunner.createTable(new Table({ name: 'rpg_class' }));
		await queryRunner.createTable(new Table({ name: 'rpg_guild' }));
		await queryRunner.createTable(new Table({ name: 'rpg_guild_rank' }));
		await queryRunner.createTable(new Table({ name: 'rpg_item' }));
		await queryRunner.createTable(new Table({ name: 'rpg_user' }));
		await queryRunner.createTable(new Table({ name: 'rpg_user_item' }));
	}
}
