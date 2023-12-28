import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V68PartialRemoveSuggestionSettings1654278189464 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'suggestions.emojis.upvote');
		await queryRunner.dropColumn('guilds', 'suggestions.emojis.downvote');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'suggestions.emojis.upvote', type: 'varchar', length: '128', default: "'s694594285487652954'" })
		);

		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'suggestions.emojis.downvote', type: 'varchar', length: '128', default: "'s694594285269680179'" })
		);
	}
}
