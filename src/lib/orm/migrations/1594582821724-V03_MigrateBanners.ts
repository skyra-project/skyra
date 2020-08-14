import { MigrationInterface, QueryRunner } from 'typeorm';

export class V03MigrateBanners1594582821724 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.banners RENAME TO "banner"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.banner RENAME TO "banners"`);
	}
}
