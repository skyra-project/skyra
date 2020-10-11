import { MigrationInterface, QueryRunner } from 'typeorm';

export class V09MigrateSuggestion1594628900945 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.suggestions RENAME TO "suggestion"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.suggestion RENAME TO "suggestions"`);
	}
}
