import { MigrationInterface, QueryRunner } from 'typeorm';

export class V12ClearOldTables1594669268323 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */`DROP TABLE dashboard_users CASCADE`);
		await queryRunner.query(/* sql */`DROP TABLE clientStorage CASCADE`);
		await queryRunner.query(/* sql */`DROP TABLE users CASCADE`);
		await queryRunner.query(/* sql */`DROP TABLE twitch_stream_subscriptions CASCADE`);
	}

	public async down(): Promise<void> {
		// N.A.
	}

}
