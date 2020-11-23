import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class V29AttachmentMode1606138444111 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameColumn('guilds', 'selfmod.attachment', 'selfmod.attachments.enabled');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentAction', 'selfmod.attachments.hardAction');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentPunishmentDuration', 'selfmod.attachments.hardActionDuration');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentMaximum', 'selfmod.attachments.thresholdMaximum');
		await queryRunner.renameColumn('guilds', 'selfmod.attachmentDuration', 'selfmod.attachments.thresholdDuration');
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
				default: () => 'ARRAY[]::VARCHAR[]'
			})
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'selfmod.attachments.ignoredChannels',
				type: 'varchar',
				isNullable: false,
				isArray: true,
				default: () => 'ARRAY[]::VARCHAR[]'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.enabled', 'selfmod.attachment');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.hardAction', 'selfmod.attachmentAction');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.hardActionDuration', 'selfmod.attachmentPunishmentDuration');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.thresholdMaximum', 'selfmod.attachmentMaximum');
		await queryRunner.renameColumn('guilds', 'selfmod.attachments.thresholdDuration', 'selfmod.attachmentDuration');
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.softAction');
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.ignoredRoles');
		await queryRunner.dropColumn('guilds', 'selfmod.attachments.ignoredChannels');
	}
}
