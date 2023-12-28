import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V52JoinAndLeaveMessageAutoDelete1619969827210 implements MigrationInterface {
	private readonly keys = ['messages.farewell-auto-delete', 'messages.greeting-auto-delete'];
	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.keys) {
			await queryRunner.addColumn(
				'guilds',
				new TableColumn({
					name: key,
					type: 'bigint',
					isNullable: true
				})
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.keys) {
			await queryRunner.dropColumn('guilds', key);
		}
	}
}
