import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V04MigrateGiveaways1594582905434 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateGiveaways(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const giveawayRawData = revertTransformGiveaways(await queryRunner.query(/* sql */ `SELECT * FROM public.giveaway;`));
		await queryRunner.clearTable('giveaway');
		await queryRunner.changeColumn(
			'giveaway',
			'ends_at',
			new TableColumn({ name: 'ends_at', type: 'bigint', isNullable: false, comment: 'The date at which the giveaway ends' })
		);

		// Save the new Giveaway entities to the database
		const stringifiedData = JSON.stringify(giveawayRawData).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.giveaway
			SELECT * FROM json_populate_recordset(NULL::public.giveaway, '${stringifiedData}')
			ON CONFLICT DO NOTHING;
		`);
	}

	private async migrateGiveaways(queryRunner: QueryRunner): Promise<void> {
		// Get the data from the "giveaway" table and transform it into Giveaway entities
		const giveawayEntities = transformGiveaways(await queryRunner.query(/* sql */ `SELECT * FROM public.giveaway;`));

		// TRUNCATE the "giveaway" table before filling it with new data
		await queryRunner.clearTable('giveaway');

		// Change the type of the ends_at column to Timestamp
		await queryRunner.changeColumn(
			'giveaway',
			'ends_at',
			new TableColumn({
				name: 'ends_at',
				type: 'timestamp without time zone',
				isNullable: false,
				comment: 'The date at which the giveaway ends'
			})
		);

		// Save the new Giveaway entities to the database
		const stringifiedData = JSON.stringify(giveawayEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.giveaway
			SELECT * FROM json_populate_recordset(NULL::public.giveaway, '${stringifiedData}')
			ON CONFLICT DO NOTHING;
		`);
	}
}

function transformGiveaways(dGiveaway: Giveaway[]): TransformedGiveaway[] {
	const output: TransformedGiveaway[] = [];

	for (const ga of dGiveaway) {
		if (Number(ga.ends_at) >= 1640995200000) continue;

		output.push({
			title: ga.title,
			ends_at: new Date(Number(ga.ends_at)),
			guild_id: ga.guild_id,
			channel_id: ga.channel_id,
			message_id: ga.message_id,
			minimum: ga.minimum,
			minimum_winners: ga.minimum_winners
		});
	}

	return output;
}

function revertTransformGiveaways(rdGiveaway: TransformedGiveaway[]): Giveaway[] {
	return rdGiveaway.map((ga) => ({
		title: ga.title,
		ends_at: new Date(ga.ends_at).getTime().toString(),
		guild_id: ga.guild_id,
		channel_id: ga.channel_id,
		message_id: ga.message_id,
		minimum: ga.minimum,
		minimum_winners: ga.minimum_winners
	}));
}

interface Giveaway {
	title: string;
	ends_at: string;
	guild_id: string;
	channel_id: string;
	message_id: string;
	minimum: number;
	minimum_winners: number;
}

interface TransformedGiveaway extends Omit<Giveaway, 'ends_at'> {
	ends_at: Date;
}
