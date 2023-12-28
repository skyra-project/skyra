import { TableCheck, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V21AddMissingChecks1597266996401 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.updateModerationChecks(queryRunner);
		await this.createUserChecks(queryRunner);
		await this.createUserProfileCheck(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await this.nukeAllTableCheckContraints('user', queryRunner);
		await this.nukeAllTableCheckContraints('user_profile', queryRunner);
		await this.nukeAllTableCheckContraints('moderation', queryRunner);

		await queryRunner.createCheckConstraints('user', [
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)`),
				columnNames: ['"duration"'],
				expression: /* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"reason"::text <> ''::text`),
				columnNames: ['"reason"'],
				expression: /* sql */ `"reason"::text <> ''::text`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"type" >= 0`),
				columnNames: ['"type"'],
				expression: /* sql */ `"type" >= 0`
			})
		]);
	}

	private async updateModerationChecks(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `ALTER TABLE guilds DROP CONSTRAINT IF EXISTS moderation_duration_check;`);
		await queryRunner.createCheckConstraint(
			'moderation',
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)`),
				columnNames: ['"duration"'],
				expression: /* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)`
			})
		);
	}

	private async createUserChecks(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createCheckConstraints('user', [
			new TableCheck({
				name: this.generateCheckName(/* sql */ `money >= 0`),
				columnNames: ['money'],
				expression: /* sql */ `money >= 0`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `points >= 0`),
				columnNames: ['points'],
				expression: /* sql */ `points >= 0`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `reputations >= 0`),
				columnNames: ['reputations'],
				expression: /* sql */ `reputations >= 0`
			})
		]);
	}

	private async createUserProfileCheck(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createCheckConstraint(
			'user_profile',
			new TableCheck({
				name: this.generateCheckName(/* sql */ `(color >= 0) AND (color <= 16777215)`),
				columnNames: ['color'],
				expression: /* sql */ `(color >= 0) AND (color <= 16777215)`
			})
		);
	}

	private async nukeAllTableCheckContraints(table: 'user' | 'user_profile' | 'moderation', queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			DO $$ DECLARE
				r RECORD;
			BEGIN
				FOR r IN (
					SELECT con.conname
					FROM pg_catalog.pg_constraint con
							INNER JOIN pg_catalog.pg_class rel
										ON rel.oid = con.conrelid
							INNER JOIN pg_catalog.pg_namespace nsp
										ON nsp.oid = connamespace
					WHERE nsp.nspname = 'public'
					AND rel.relname = '${table}'
					AND conname LIKE ${process.env.NODE_ENV === 'development' ? "'%CHK%'" : "'%_check%'"}
				) LOOP
					EXECUTE 'ALTER TABLE guilds DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' ';
				END LOOP;
			END $$;
		`);
	}

	/**
	 * Generates a random check name the same way typeorm does for the"@check" decorators
	 * @see https://github.com/typeorm/typeorm/blob/ec3be4115faba62c1dbbc786ec9283438362bb50/src/naming-strategy/DefaultNamingStrategy.ts#L106-L111
	 */
	private generateCheckName(expression: string): string {
		const tableName = 'guilds';
		const replacedTableName = tableName.replace('.', '_');
		const key = `${replacedTableName}_${expression}`;
		return `CHK_${key}`;
	}
}
