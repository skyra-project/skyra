import type { NonNullObject } from '@sapphire/utilities';
import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V07MigrateModeration1594583300041 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateModerations(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const moderationRawData = revertTransformModerations(await queryRunner.query(/* sql */ `SELECT * FROM public.moderation;`));
		await queryRunner.clearTable('moderation');
		await queryRunner.changeColumn(
			'moderation',
			'created_at',
			new TableColumn({ name: 'created_at', type: 'bigint', isNullable: true, comment: 'The date at which the moderation entry was made' })
		);

		const stringifiedData = JSON.stringify(moderationRawData).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.moderation
			SELECT * FROM json_populate_recordset(NULL::public.moderation, '${stringifiedData}')
			ON CONFLICT DO NOTHING;
		`);
	}

	private async migrateModerations(queryRunner: QueryRunner): Promise<void> {
		// Get the data from the "moderation" table and transform it into Moderation entities
		const moderationEntities = transformModerations(await queryRunner.query(/* sql */ `SELECT * FROM public.moderation;`));

		// TRUNCATE the "moderation" table before filling it with new data
		await queryRunner.clearTable('moderation');

		// Change the type of the created_at column to Timestamp
		await queryRunner.changeColumn(
			'moderation',
			'created_at',
			new TableColumn({
				name: 'created_at',
				type: 'timestamp without time zone',
				isNullable: true,
				default: null,
				comment: 'The date at which the moderation entry was created'
			})
		);

		// Save the new Moderation entities to the database
		const stringifiedData = JSON.stringify(moderationEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.moderation
			SELECT * FROM json_populate_recordset(NULL::public.moderation, '${stringifiedData}')
			ON CONFLICT DO NOTHING;
		`);
	}
}

function transformModerations(dModeration: Moderation[]): TransformedModeration[] {
	return dModeration.map((mod) => ({
		case_id: mod.case_id,
		created_at: mod.created_at === null ? null : new Date(Number(mod.created_at)),
		duration: mod.duration,
		extra_data: mod.extra_data,
		guild_id: mod.guild_id,
		moderator_id: mod.moderator_id,
		reason: mod.reason,
		image_url: mod.image_url,
		type: mod.type,
		user_id: mod.user_id
	}));
}

function revertTransformModerations(rdModerations: TransformedModeration[]): Moderation[] {
	return rdModerations.map((mod) => ({
		case_id: mod.case_id,
		created_at: mod.created_at ? new Date(mod.created_at).getTime().toString() : null,
		duration: mod.duration,
		extra_data: mod.extra_data,
		guild_id: mod.guild_id,
		image_url: mod.image_url,
		moderator_id: mod.moderator_id,
		reason: mod.reason,
		type: mod.type,
		user_id: mod.user_id
	}));
}

interface Moderation {
	case_id: number;
	created_at: string | null;
	duration: number;
	extra_data: unknown[] | NonNullObject | null;
	guild_id: string;
	moderator_id: string;
	reason: string;
	user_id: string;
	type: number;
	image_url: string | null;
}

interface TransformedModeration extends Omit<Moderation, 'created_at'> {
	created_at: Date | null;
}
