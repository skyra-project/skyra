import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V37BirthdayIntegration1615269810077 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumns('guilds', [
			new TableColumn({ name: 'birthday.channel', type: 'varchar', isNullable: true, length: '19' }),
			new TableColumn({ name: 'birthday.message', type: 'varchar', isNullable: true, length: '200' }),
			new TableColumn({ name: 'birthday.role', type: 'varchar', isNullable: true, length: '19' })
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'birthday.channel');
		await queryRunner.dropColumn('guilds', 'birthday.role');
		await queryRunner.dropColumn('guilds', 'birthday.message');
	}
}
