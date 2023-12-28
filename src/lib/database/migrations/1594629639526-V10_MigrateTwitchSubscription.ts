import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V10MigrateTwitchSubscription1594629639526 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'twitch_stream_subscription',
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '16', isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'is_streaming', type: 'boolean', isNullable: false }),
					new TableColumn({ name: 'expires_at', type: 'timestamp', isNullable: false }),
					new TableColumn({
						name: 'guild_ids',
						type: 'varchar',
						length: '19',
						isArray: true,
						isNullable: false,
						default: 'ARRAY[]::VARCHAR[]'
					})
				]
			})
		);

		// Get the data from the "users" table and transform it into User and UserProfile entities
		const subscriptionEntities = transformTwitchSubscription(
			await queryRunner.query(/* sql */ `SELECT * FROM public.twitch_stream_subscriptions;`)
		);

		// Save the new TwitchStreamSubscription entities to the database
		const stringifiedSubscriptionData = JSON.stringify(subscriptionEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.twitch_stream_subscription
			SELECT * FROM json_populate_recordset(NULL::public.twitch_stream_subscription, '${stringifiedSubscriptionData}')
			ON CONFLICT DO NOTHING;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Get the data from the "users" table and transform it into User and UserProfile entities
		const subscriptionEntities = revertTransformTwitchSubscription(
			await queryRunner.query(/* sql */ `SELECT * FROM public.twitch_stream_subscription;`)
		);

		// Save the new TwitchStreamSubscription entities to the database
		const stringifiedSubscriptionData = JSON.stringify(subscriptionEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.twitch_stream_subscriptions
			SELECT * FROM json_populate_recordset(NULL::public.twitch_stream_subscriptions, '${stringifiedSubscriptionData}')
			ON CONFLICT DO NOTHING;
		`);

		await queryRunner.dropTable('twitch_stream_subscription');
	}
}

function transformTwitchSubscription(subscriptions: TwitchStreamSubscription[]): TransformedTwitchStreamSubscription[] {
	return subscriptions.map((sc) => ({
		id: sc.id,
		is_streaming: sc.is_streaming,
		expires_at: new Date(Number(sc.expires_at)),
		guild_ids: sc.guild_ids
	}));
}

function revertTransformTwitchSubscription(subscriptions: TransformedTwitchStreamSubscription[]): TwitchStreamSubscription[] {
	return subscriptions.map((sc) => ({
		id: sc.id,
		is_streaming: sc.is_streaming,
		expires_at: new Date(sc.expires_at).getTime(),
		guild_ids: sc.guild_ids
	}));
}

interface TwitchStreamSubscription {
	id: string;
	is_streaming: boolean;
	expires_at: number;
	guild_ids: string[];
}

interface TransformedTwitchStreamSubscription {
	id: string;
	is_streaming: boolean;
	expires_at: Date;
	guild_ids: string[];
}
