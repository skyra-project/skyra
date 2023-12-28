import { TableCheck, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V34IncreasedModerationDurations1610659806881 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Modify guild schema:
		const guilds = (await queryRunner.getTable('guilds'))!;
		await queryRunner.dropCheckConstraints(guilds, guilds.checks);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.attachments.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.capitals.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.links.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.messages.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.newlines.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.invites.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.filter.hardActionDuration" TYPE bigint;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.reactions.hardActionDuration" TYPE bigint;`);

		// Modify moderation schema:
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER "duration" TYPE bigint;`);

		// Modify checks:
		const moderation = (await queryRunner.getTable('moderation'))!;
		const check = moderation.checks.find((check) => check.expression?.includes('duration'));
		if (check) await queryRunner.dropCheckConstraint(moderation, check);
		await queryRunner.createCheckConstraint(
			'moderation',
			new TableCheck({ expression: /* sql */ `("duration" >= 0) AND ("duration" <= 157680000000)` })
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Modify guild schema:
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.attachments.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.capitals.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.links.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.messages.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.newlines.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.invites.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.filter.hardActionDuration" TYPE integer;`);
		await queryRunner.query(/* sql */ `ALTER TABLE public.guilds ALTER "selfmod.reactions.hardActionDuration" TYPE integer;`);

		await queryRunner.createCheckConstraints('guilds', [
			new TableCheck({ expression: /* sql */ `"prefix"::text <> ''::text` }),
			new TableCheck({ expression: /* sql */ `"selfmod.attachments.hardActionDuration" >= 1000` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.attachments.thresholdMaximum" >= 0) AND ("selfmod.attachments.thresholdMaximum" <= 60)`
			}),
			new TableCheck({
				expression: /* sql */ `("selfmod.attachments.thresholdDuration" >= 0) AND ("selfmod.attachments.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `("selfmod.capitals.minimum" >= 5) AND ("selfmod.capitals.minimum" <= 2000)` }),
			new TableCheck({ expression: /* sql */ `("selfmod.capitals.maximum" >= 10) AND ("selfmod.capitals.maximum" <= 100)` }),
			new TableCheck({ expression: /* sql */ `"selfmod.capitals.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.capitals.thresholdMaximum" >= 0) AND ("selfmod.capitals.thresholdMaximum" <= 60)` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.capitals.thresholdDuration" >= 0) AND ("selfmod.capitals.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `("selfmod.newlines.maximum" >= 10) AND ("selfmod.newlines.maximum" <= 2000)` }),
			new TableCheck({ expression: /* sql */ `"selfmod.newlines.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.newlines.thresholdMaximum" >= 0) AND ("selfmod.newlines.thresholdMaximum" <= 60)` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.newlines.thresholdDuration" >= 0) AND ("selfmod.newlines.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `"selfmod.invites.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.invites.thresholdMaximum" >= 0) AND ("selfmod.invites.thresholdMaximum" <= 60)` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.invites.thresholdDuration" >= 0) AND ("selfmod.invites.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `"selfmod.filter.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.filter.thresholdMaximum" >= 0) AND ("selfmod.filter.thresholdMaximum" <= 60)` }),
			new TableCheck({ expression: /* sql */ `("selfmod.filter.thresholdDuration" >= 0) AND ("selfmod.filter.thresholdDuration" <= 120000)` }),
			new TableCheck({ expression: /* sql */ `"selfmod.reactions.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.reactions.thresholdMaximum" >= 0) AND ("selfmod.reactions.thresholdMaximum" <= 20)` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.reactions.thresholdDuration" >= 0) AND ("selfmod.reactions.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `"selfmod.messages.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.messages.thresholdMaximum" >= 0) AND ("selfmod.messages.thresholdMaximum" <= 60)` }),
			new TableCheck({
				expression: /* sql */ `("selfmod.messages.thresholdDuration" >= 0) AND ("selfmod.messages.thresholdDuration" <= 120000)`
			}),
			new TableCheck({ expression: /* sql */ `"selfmod.links.hardActionDuration" >= 1000` }),
			new TableCheck({ expression: /* sql */ `("selfmod.links.thresholdMaximum" >= 0) AND ("selfmod.links.thresholdMaximum" <= 60)` }),
			new TableCheck({ expression: /* sql */ `("selfmod.links.thresholdDuration" >= 0) AND ("selfmod.links.thresholdDuration" <= 120000)` }),
			new TableCheck({ expression: /* sql */ `("selfmod.raidthreshold" >= 2) AND ("selfmod.raidthreshold" <= 50)` }),
			new TableCheck({ expression: /* sql */ `"no-mention-spam.mentionsAllowed" >= 0` }),
			new TableCheck({ expression: /* sql */ `"no-mention-spam.timePeriod" >= 0` }),
			new TableCheck({ expression: /* sql */ `"starboard.minimum" >= 1` })
		]);

		// Modify moderation schema:
		await queryRunner.query(/* sql */ `ALTER TABLE public.moderation ALTER "duration" TYPE integer;`);

		// Modify checks:
		const moderation = (await queryRunner.getTable('moderation'))!;
		const check = moderation.checks.find((check) => check.expression?.includes('duration'));
		if (check) await queryRunner.dropCheckConstraint(moderation, check);
		await queryRunner.createCheckConstraint(
			'moderation',
			new TableCheck({ expression: /* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)` })
		);
	}
}
