import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V32SeparatedMemberNameUpdateLogs1606948188150 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameColumn('guilds', 'events.memberNameUpdate', 'events.member-nickname-update');
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'events.member-username-update',
				type: 'boolean',
				isNullable: true,
				default: false
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameColumn('guilds', 'events.member-nickname-update', 'events.memberNameUpdate');
		await queryRunner.dropColumn('guilds', 'events.member-username-update');
	}
}
