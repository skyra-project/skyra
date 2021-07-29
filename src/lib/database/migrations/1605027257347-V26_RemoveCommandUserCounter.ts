import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V26RemoveCommandUseCounter1605027257347 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE guilds DROP COLUMN "commandUses";`);
		await queryRunner.query(/* sql */ `ALTER TABLE guilds DROP COLUMN IF EXISTS "suggestions.selfStar";`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE guilds ADD COLUMN "commandUses" integer DEFAULT 0;`);
	}
}
