import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V61AddMusicAutoLeave1634379789387 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.auto-leave', type: 'boolean', default: 'true' }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'music.auto-leave');
	}
}
