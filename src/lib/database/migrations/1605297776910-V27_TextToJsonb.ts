import type { MigrationInterface, QueryRunner } from 'typeorm';

const columnsToModify = [
	'custom-commands',
	'permissions.users',
	'permissions.roles',
	'command-autodelete',
	'disabledCommandsChannels',
	'stickyRoles',
	'reaction-roles',
	'roles.auto',
	'roles.uniqueRoleSets',
	'trigger.alias',
	'trigger.includes',
	'notifications.streams.twitch.streamers'
];

export class V27TextToJsonb1605297776910 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			CREATE OR REPLACE FUNCTION jsonb_array_to_jsonb(jsonb[])
				RETURNS jsonb
				language sql as
			$$
			SELECT to_jsonb($1)
			$$;
		`);

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
							SET DATA TYPE jsonb
							USING jsonb_array_to_jsonb("${column}"::JSONB[]);

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET DEFAULT '[]'::JSONB;

					UPDATE guilds
					SET "${column}" = '[]'::JSONB
					WHERE "${column}" IS NULL;

					ALTER TABLE guilds
						ALTER COLUMN "${column}"
							SET NOT NULL;
				`)
			)
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await Promise.all(
			columnsToModify.map((column) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE guilds
					ALTER COLUMN "${column}" SET DATA TYPE text[];

					ALTER TABLE guilds
					ALTER COLUMN "${column}" SET DEFAULT ARRAY []::json[];
				`)
			)
		);
	}
}
