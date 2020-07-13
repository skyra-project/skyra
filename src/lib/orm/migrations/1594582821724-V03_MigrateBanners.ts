import { MigrationInterface, QueryRunner } from 'typeorm';

export class V03MigrateBanners1594582821724 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateBanners(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameTable('banner', 'banners');
	}

	private async migrateBanners(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameTable('banners', 'banner');
	}

}
