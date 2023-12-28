import { Table, TableCheck, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V50RemoveDatabaseChecks1618951687674 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.dropChecks(queryRunner, 'banner');
		await this.dropChecks(queryRunner, 'giveaway');
		await this.dropChecks(queryRunner, 'guilds');
		await this.dropChecks(queryRunner, 'member');
		await this.dropChecks(queryRunner, 'starboard');
		await this.dropChecks(queryRunner, 'user');
		await this.dropChecks(queryRunner, 'user_profile');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Banner
		await queryRunner.createCheckConstraint('banner', new TableCheck({ expression: /* sql */ `"group"::text <> ''::text` }));
		await queryRunner.createCheckConstraint('banner', new TableCheck({ expression: /* sql */ `"title"::text <> ''::text` }));
		await queryRunner.createCheckConstraint('banner', new TableCheck({ expression: /* sql */ `"price" >= 0` }));

		// Giveaway
		await queryRunner.createCheckConstraint('giveaway', new TableCheck({ expression: /* sql */ `"minimum" <> 0` }));
		await queryRunner.createCheckConstraint('giveaway', new TableCheck({ expression: /* sql */ `"minimum_winners" <> 0` }));

		// Guilds
		await queryRunner.createCheckConstraint(
			'guilds',
			new TableCheck({ expression: /* sql */ `("duration" >= 0) AND ("duration" <= 157680000000)` })
		);
		await queryRunner.createCheckConstraint('guilds', new TableCheck({ expression: /* sql */ `"reason"::text <> ''::text` }));
		await queryRunner.createCheckConstraint('guilds', new TableCheck({ expression: /* sql */ `"type" >= 0` }));

		// Member
		await queryRunner.createCheckConstraint('member', new TableCheck({ expression: /* sql */ `"points" >= 0` }));

		// Starboard
		await queryRunner.createCheckConstraint('starboard', new TableCheck({ expression: /* sql */ `"stars" >= 0` }));

		// User
		await queryRunner.createCheckConstraint('user', new TableCheck({ expression: /* sql */ `"money" >= 0` }));
		await queryRunner.createCheckConstraint('user', new TableCheck({ expression: /* sql */ `"points" >= 0` }));
		await queryRunner.createCheckConstraint('user', new TableCheck({ expression: /* sql */ `"reputations" >= 0` }));

		// User Profile
		await queryRunner.createCheckConstraint('user_profile', new TableCheck({ expression: /* sql */ `(color >= 0) AND (color <= 16777215)` }));
	}

	private async dropChecks(queryRunner: QueryRunner, name: string) {
		const table = (await queryRunner.getTable(name)) as Table;
		await queryRunner.dropCheckConstraints(table, table.checks);
	}
}
