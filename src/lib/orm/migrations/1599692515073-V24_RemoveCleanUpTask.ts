import { MigrationInterface, QueryRunner } from 'typeorm';

export class V24RemoveCleanUpTask1599692515073 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `DELETE FROM public.schedule WHERE task_id = 'cleanup';`);
	}

	public async down(): Promise<void> {
		// noop
	}
}
