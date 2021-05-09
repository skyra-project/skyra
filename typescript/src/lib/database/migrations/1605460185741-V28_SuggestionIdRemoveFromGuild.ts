import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V28SuggestionIdRemoveFromGuild1605460185741 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE guilds DROP COLUMN IF EXISTS "suggestions.id";`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Start at 100 in case a revert is needed, the current highest suggestion is 76 so this is a safe number to start at.
		await queryRunner.query(/* sql */ `ALTER TABLE guilds ADD COLUMN "suggestions.id" integer DEFAULT 100;`);
	}
}
