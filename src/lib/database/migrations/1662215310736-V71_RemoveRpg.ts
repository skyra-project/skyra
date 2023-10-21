import { Table, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V71RemoveRpg1662215310736 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_user CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_user_item CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_battle CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_class CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_guild CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_guild_rank CASCADE;`);
		await queryRunner.query(/* sql */ `DROP TABLE IF EXISTS public.rpg_item CASCADE;`);
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
