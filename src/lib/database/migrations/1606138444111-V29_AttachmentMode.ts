import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V29AttachmentMode1606138444111 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Rename the current column into the new ones, for consistency with the others:
		await queryRunner.renameColumn('guilds', 'selfmod.attachment', 'selfmod.attachments.enabled');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentAction', 'selfmod.attachments.hardAction');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentPunishmentDuration', 'selfmod.attachments.hardActionDuration');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentMaximum', 'selfmod.attachments.thresholdMaximum');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentDuration', 'selfmod.attachments.thresholdDuration');

		// Create the new columns:
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'selfmod.attachments.softAction', type: 'smallint', isNullable: false, default: 0 })
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'selfmod.attachments.ignoredRoles',
				type: 'varchar',
				isNullable: false,
				isArray: true,
				default: 'ARRAY[]::VARCHAR[]'
			})
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'selfmod.attachments.ignoredChannels',
				type: 'varchar',
				isNullable: false,
				isArray: true,
				default: 'ARRAY[]::VARCHAR[]'
			})
		);

		// Transform the old data into the new one:
		await queryRunner.query(/* sql */ `
			UPDATE public.guilds
			SET
				-- 1010 (Log + 010 [2]) should be converted to 010 (Log) and 011 [3], therefore we read the smallint
				-- as a 4-bit bitfield, read the first bit ('1') and shift it by one, this way we get 010 [2] in action.
				-- Then we convert the action into a 3-bit bitfield ('1010'::bit(3) becomes '010'::bit(3)) and add one,
				-- thus we get 011 [3].
				"selfmod.attachments.softAction" = get_bit("selfmod.attachments.hardAction"::integer::bit(4), 0) << 1,
				"selfmod.attachments.hardAction" = "selfmod.attachments.hardAction"::integer::bit(3)::int + 1;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Transform the new data into the old one, this needs the new columns in order to be able to reset the data
		// into the old format, which combined two columns in one:
		await queryRunner.query(/* sql */ `
			UPDATE public.guilds
			SET
				-- We do the opposite, if we have to reduce hardAction by one (011 [3] becomes 010 [2]), then we add the
				-- bit from softAction shifted by 3, that way, if softAction was x1x, get_bit would return 1, and after
				-- << 3, it'd turn into 1000. We add this and get 1010 back.
				"selfmod.attachments.hardAction" = ("selfmod.attachments.hardAction" - 1) + (get_bit("selfmod.attachments.softAction"::integer::bit(3), 1) << 3);
		`);

		// Rename the new columns into the old ones:
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.enabled', 'selfmod.attachment');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.hardAction', 'selfmod.attachmentAction');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.hardActionDuration', 'selfmod.attachmentPunishmentDuration');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.thresholdMaximum', 'selfmod.attachmentMaximum');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.thresholdDuration', 'selfmod.attachmentDuration');

		// Drop the new columns:
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.softAction');
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.ignoredRoles');
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.ignoredChannels');
	}
}
