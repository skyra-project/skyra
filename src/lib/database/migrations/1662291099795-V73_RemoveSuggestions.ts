import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V73RemoveSuggestions1662291099795 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'suggestions.channel');
		await queryRunner.dropColumn('guilds', 'suggestions.on-action.dm');
		await queryRunner.dropColumn('guilds', 'suggestions.on-action.repost');
		await queryRunner.dropColumn('guilds', 'suggestions.on-action.hide-author');

		await queryRunner.dropTable('suggestion');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'suggestions.channel', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'suggestions.on-action.dm', type: 'boolean', default: 'false' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'suggestions.on-action.repost', type: 'boolean', default: 'false' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'suggestions.on-action.hide-author', type: 'boolean', default: 'false' }));

		await queryRunner.createTable(
			new Table({
				name: 'suggestion',
				columns: [
					new TableColumn({ name: 'id', type: 'integer', isPrimary: true }),
					new TableColumn({ name: 'guild_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'message_id', type: 'varchar', length: '19' }),
					new TableColumn({ name: 'author_id', type: 'varchar', length: '19' })
				]
			})
		);
	}
}
