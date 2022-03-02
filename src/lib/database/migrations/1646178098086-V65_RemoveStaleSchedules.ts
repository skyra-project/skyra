import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V65VersionSevenRemoveStaleSchedules1646178098086 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			DELETE FROM public.schedule
			WHERE task_id = 'birthday' OR task_id = 'removeBirthdayRole';
		`);
	}

	public async down(): Promise<void> {
		// NOP
	}
}
