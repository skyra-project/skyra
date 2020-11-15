import { MigrationInterface, QueryRunner } from 'typeorm';

export class V06MigrateMembers1594583243068 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateMembers(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE public.member RENAME TO "members"`);

		await queryRunner.renameColumn('members', 'points', 'point_count');
	}

	private async migrateMembers(queryRunner: QueryRunner): Promise<void> {
		// Rename "members" table to "member"
		await queryRunner.query(/* sql */ `ALTER TABLE public.members RENAME TO "member"`);

		// Rename "point_count" column to "points"
		await queryRunner.renameColumn('member', 'point_count', 'points');
	}
}
