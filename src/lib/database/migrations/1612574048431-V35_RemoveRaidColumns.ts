import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V35RemoveRaidColumns1612574048431 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'selfmod.raid');
		await queryRunner.dropColumn('guilds', 'selfmod.raidthreshold');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumns('guilds', [
			new TableColumn({
				name: 'selfmod.raid',
				default: false,
				type: 'boolean',
				isNullable: false
			}),
			new TableColumn({
				name: 'selfmod.raidthreshold',
				default: 10,
				type: 'smallint',
				isNullable: false
			})
		]);
	}
}
