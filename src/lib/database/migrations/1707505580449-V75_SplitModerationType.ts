import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V75SplitModerationType1707505580449 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('moderation', new TableColumn({ name: 'metadata', type: 'smallint', default: 0, isNullable: false }));
		await queryRunner.query(/* sql */ `
			UPDATE public.moderation
				-- metadata = (type & 0b1111_0000) >> 4
			SET "metadata" = ((("type"::integer::bit(8) & B'11110000'::bit(8)) >> 4))::integer::smallint,
				-- type = (type & 0b0000_1111)
				"type" = ("type"::integer::bit(8) & B'00001111'::bit(8))::integer::smallint;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			UPDATE public.moderation
				-- type = (metadata << 4) | type
			SET "type" = (("metadata"::integer::bit(8) << 4) | "type"::integer::bit(8))::integer::smallint;
		`);
		await queryRunner.dropColumn('moderation', 'metadata');
	}
}
