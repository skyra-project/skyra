import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V66ExpandGuildSubscriptionMessage1647241680539 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public.guild_subscription
			ALTER COLUMN message
				TYPE VARCHAR(200);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public.guild_subscription
			ALTER COLUMN message
				TYPE VARCHAR(50);
		`);
	}
}
