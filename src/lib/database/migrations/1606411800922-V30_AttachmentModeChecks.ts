import { TableCheck, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V30AttachmentModeChecks1606411800922 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.nukeAllGuildEntityCheckContraints(queryRunner);
		await this.createNewCheckContraints(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// down is intentionally identical as up here because it defines how the checks should've always been
		await this.nukeAllGuildEntityCheckContraints(queryRunner);
		await this.createNewCheckContraints(queryRunner);
	}

	private async nukeAllGuildEntityCheckContraints(queryRunner: QueryRunner): Promise<void> {
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
					AND rel.relname = 'guilds'
					AND conname LIKE 'CHK_%'
				) LOOP
					EXECUTE 'ALTER TABLE guilds DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' ';
				END LOOP;
			END $$;
		`);
	}

	private async createNewCheckContraints(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createCheckConstraints('guilds', [
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"prefix"::text <> ''::text`),
				columnNames: ['"prefix"'],
				expression: /* sql */ `"prefix"::text <> ''::text`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.attachments.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.attachments.hardActionDuration"'],
				expression: /* sql */ `"selfmod.attachments.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.attachments.thresholdMaximum" >= 0) AND ("selfmod.attachments.thresholdMaximum" <= 60)`
				),
				columnNames: ['"selfmod.attachments.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.attachments.thresholdMaximum" >= 0) AND ("selfmod.attachments.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.attachments.thresholdDuration" >= 0) AND ("selfmod.attachments.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.attachments.thresholdDuration"'],
				expression: /* sql */ `("selfmod.attachments.thresholdDuration" >= 0) AND ("selfmod.attachments.thresholdDuration" <= 120000)`
			}),

			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.capitals.minimum" >= 5) AND ("selfmod.capitals.minimum" <= 2000)`),
				columnNames: ['"selfmod.capitals.minimum"'],
				expression: /* sql */ `("selfmod.capitals.minimum" >= 5) AND ("selfmod.capitals.minimum" <= 2000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.capitals.maximum" >= 10) AND ("selfmod.capitals.maximum" <= 100)`),
				columnNames: ['"selfmod.capitals.maximum"'],
				expression: /* sql */ `("selfmod.capitals.maximum" >= 10) AND ("selfmod.capitals.maximum" <= 100)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.capitals.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.capitals.hardActionDuration"'],
				expression: /* sql */ `"selfmod.capitals.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.capitals.thresholdMaximum" >= 0) AND ("selfmod.capitals.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.capitals.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.capitals.thresholdMaximum" >= 0) AND ("selfmod.capitals.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.capitals.thresholdDuration" >= 0) AND ("selfmod.capitals.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.capitals.thresholdDuration"'],
				expression: /* sql */ `("selfmod.capitals.thresholdDuration" >= 0) AND ("selfmod.capitals.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.newlines.maximum" >= 10) AND ("selfmod.newlines.maximum" <= 2000)`),
				columnNames: ['"selfmod.newlines.maximum"'],
				expression: /* sql */ `("selfmod.newlines.maximum" >= 10) AND ("selfmod.newlines.maximum" <= 2000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.newlines.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.newlines.hardActionDuration"'],
				expression: /* sql */ `"selfmod.newlines.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.newlines.thresholdMaximum" >= 0) AND ("selfmod.newlines.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.newlines.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.newlines.thresholdMaximum" >= 0) AND ("selfmod.newlines.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.newlines.thresholdDuration" >= 0) AND ("selfmod.newlines.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.newlines.thresholdDuration"'],
				expression: /* sql */ `("selfmod.newlines.thresholdDuration" >= 0) AND ("selfmod.newlines.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.invites.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.invites.hardActionDuration"'],
				expression: /* sql */ `"selfmod.invites.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.invites.thresholdMaximum" >= 0) AND ("selfmod.invites.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.invites.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.invites.thresholdMaximum" >= 0) AND ("selfmod.invites.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.invites.thresholdDuration" >= 0) AND ("selfmod.invites.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.invites.thresholdDuration"'],
				expression: /* sql */ `("selfmod.invites.thresholdDuration" >= 0) AND ("selfmod.invites.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.filter.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.filter.hardActionDuration"'],
				expression: /* sql */ `"selfmod.filter.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.filter.thresholdMaximum" >= 0) AND ("selfmod.filter.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.filter.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.filter.thresholdMaximum" >= 0) AND ("selfmod.filter.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.filter.thresholdDuration" >= 0) AND ("selfmod.filter.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.filter.thresholdDuration"'],
				expression: /* sql */ `("selfmod.filter.thresholdDuration" >= 0) AND ("selfmod.filter.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.reactions.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.reactions.hardActionDuration"'],
				expression: /* sql */ `"selfmod.reactions.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.reactions.thresholdMaximum" >= 0) AND ("selfmod.reactions.thresholdMaximum" <= 20)`
				),
				columnNames: ['"selfmod.reactions.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.reactions.thresholdMaximum" >= 0) AND ("selfmod.reactions.thresholdMaximum" <= 20)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.reactions.thresholdDuration" >= 0) AND ("selfmod.reactions.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.reactions.thresholdDuration"'],
				expression: /* sql */ `("selfmod.reactions.thresholdDuration" >= 0) AND ("selfmod.reactions.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.messages.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.messages.hardActionDuration"'],
				expression: /* sql */ `"selfmod.messages.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.messages.thresholdMaximum" >= 0) AND ("selfmod.messages.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.messages.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.messages.thresholdMaximum" >= 0) AND ("selfmod.messages.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(
					/* sql */ `("selfmod.messages.thresholdDuration" >= 0) AND ("selfmod.messages.thresholdDuration" <= 120000)`
				),
				columnNames: ['"selfmod.messages.thresholdDuration"'],
				expression: /* sql */ `("selfmod.messages.thresholdDuration" >= 0) AND ("selfmod.messages.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"selfmod.links.hardActionDuration" >= 1000`),
				columnNames: ['"selfmod.links.hardActionDuration"'],
				expression: /* sql */ `"selfmod.links.hardActionDuration" >= 1000`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.links.thresholdMaximum" >= 0) AND ("selfmod.links.thresholdMaximum" <= 60)`),
				columnNames: ['"selfmod.links.thresholdMaximum"'],
				expression: /* sql */ `("selfmod.links.thresholdMaximum" >= 0) AND ("selfmod.links.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.links.thresholdDuration" >= 0) AND ("selfmod.links.thresholdDuration" <= 120000)`),
				columnNames: ['"selfmod.links.thresholdDuration"'],
				expression: /* sql */ `("selfmod.links.thresholdDuration" >= 0) AND ("selfmod.links.thresholdDuration" <= 120000)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `("selfmod.raidthreshold" >= 2) AND ("selfmod.raidthreshold" <= 50)`),
				columnNames: ['"selfmod.raidthreshold"'],
				expression: /* sql */ `("selfmod.raidthreshold" >= 2) AND ("selfmod.raidthreshold" <= 50)`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"no-mention-spam.mentionsAllowed" >= 0`),
				columnNames: ['"no-mention-spam.mentionsAllowed"'],
				expression: /* sql */ `"no-mention-spam.mentionsAllowed" >= 0`
			}),
			new TableCheck({
				name: this.generateCheckName(/* sql */ `"no-mention-spam.timePeriod" >= 0`),
				columnNames: ['"no-mention-spam.timePeriod"'],
				expression: /* sql */ `"no-mention-spam.timePeriod" >= 0`
			})
		]);
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
