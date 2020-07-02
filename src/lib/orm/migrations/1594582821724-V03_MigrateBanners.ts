import { MigrationInterface, QueryRunner } from 'typeorm';

export class V03MigrateBanners1594582821724 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateBanners(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */`ALTER TABLE public.banner RENAME TO "banners"`);
	}

	private async migrateBanners(queryRunner: QueryRunner): Promise<void> {
		// Rename "banners" table to "banner"
		await queryRunner.query(/* sql */`ALTER TABLE public.banners RENAME TO "banner"`);
	}

}
