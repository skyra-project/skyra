import { MigrationInterface, QueryRunner } from 'typeorm';

export class V12ClearOldTables1594669268323 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `DROP TABLE public.dashboard_users CASCADE`);
		await queryRunner.query(/* sql */ `DROP TABLE public."clientStorage" CASCADE`);
		await queryRunner.query(/* sql */ `DROP TABLE public."users" CASCADE`);
		await queryRunner.query(/* sql */ `DROP TABLE public.twitch_stream_subscriptions CASCADE`);
	}

	public async down(): Promise<void> {
		// N.A.
	}
}
