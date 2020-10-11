import { CLIENT_ID } from '@root/config';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class V17MigrateModeratorNonNull1596269328762 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `UPDATE public.moderation SET moderator_id = '${CLIENT_ID}' WHERE moderator_id IS NULL;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER COLUMN moderator_id SET DEFAULT '${CLIENT_ID}';`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER COLUMN moderator_id SET NOT NULL;`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER COLUMN moderator_id DROP NOT NULL;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER COLUMN moderator_id SET DEFAULT NULL;`);
		await queryRunner.query(/* sql */ `UPDATE public.moderation SET moderator_id = NULL WHERE moderator_id = '${CLIENT_ID}';`);
	}
}
