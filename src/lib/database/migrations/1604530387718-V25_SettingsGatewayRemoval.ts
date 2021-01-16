import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V25SettingsGatewayRemoval1604530387718 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public.guilds
			ALTER COLUMN "selfmod.newlines.maximum"
			SET DEFAULT 20;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public.guilds
			ALTER COLUMN "selfmod.newlines.maximum"
			SET DEFAULT 10;
		`);
	}
}
