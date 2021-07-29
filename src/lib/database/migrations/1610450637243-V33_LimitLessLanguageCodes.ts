import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V33LimitLessLanguageCodes1610450637243 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER language TYPE varchar;`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER language TYPE varchar(5);`);
	}
}
