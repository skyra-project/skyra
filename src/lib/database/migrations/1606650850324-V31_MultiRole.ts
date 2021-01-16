import type { MigrationInterface, QueryRunner } from 'typeorm';

const columnsToModify = ['roles.admin', 'roles.moderator', 'roles.dj'];

export class V31MultiRole1606650850324 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			CREATE OR REPLACE FUNCTION nullable_varchar_to_varchar_array(varchar)
				RETURNS varchar[]
				language sql as
			$$
			SELECT CASE
				WHEN $1 IS NULL
				THEN ARRAY[]::varchar[]
				ELSE ARRAY[$1]::varchar[]
			END
			$$;
		`);

		await Promise.all(
			columnsToModify.map((column) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET DATA TYPE varchar(19)[]
							USING nullable_varchar_to_varchar_array("${column}");

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET DEFAULT ARRAY[]::varchar[];

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET NOT NULL;
				`)
			)
		);

		await queryRunner.query(/* sql */ `
			DROP FUNCTION IF EXISTS nullable_varchar_to_varchar_array(varchar);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await Promise.all(
			columnsToModify.map((column) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							DROP NOT NULL;

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							DROP DEFAULT;

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET DATA TYPE varchar(19)
							USING "${column}"[1];
				`)
			)
		);
	}
}
