import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V51NewSocialFeaturesAndValueRename1619089555427 implements MigrationInterface {
	private oldRegExp = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;
	private newRegExp = /{(?:role\.name|member(?:\.username)?|server|points)}/g;

	private defaultNewMessage = 'Congratulations dear {member}, you achieved the role {role.name}';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-role', type: 'varchar', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-level', type: 'varchar', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-channel', type: 'varchar', isNullable: true, length: '19' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-multiple', type: 'smallint', default: 1 }));

		const entries = (await queryRunner.query(
			/* sql */ `SELECT "id", "social.achieve", "social.achieve-message" FROM public.guilds WHERE "social.achieve" OR char_length("social.achieve-message") > 1;`
		)) as OldEntry[];

		for (const entry of entries) {
			const achieve = entry['social.achieve'];
			if (!achieve) continue;

			const message = entry['social.achieve-message'];
			await queryRunner.query(/* sql */ `UPDATE public.guilds SET "social.achieve-role" = $2 WHERE id = $1;`, [
				entry.id,
				message ? this.transformToNew(message) : this.defaultNewMessage
			]);
		}

		await queryRunner.dropColumn('guilds', 'social.achieve');
		await queryRunner.dropColumn('guilds', 'social.achieve-message');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve', type: 'boolean', default: false }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'social.achieve-message', type: 'varchar', isNullable: true, length: '2000' }));

		const entries = (await queryRunner.query(
			/* sql */ `SELECT "id", "social.achieve-role" FROM public.guilds WHERE char_length("social.achieve-role") > 1;`
		)) as NewEntry[];

		for (const entry of entries) {
			const message = entry['social.achieve-role'];
			if (!message) continue;

			if (message === this.defaultNewMessage) {
				await queryRunner.query(/* sql */ `UPDATE public.guilds SET "social.achieve" = $2 WHERE id = $1;`, [entry.id, true]);
			} else {
				await queryRunner.query(
					/* sql */ `UPDATE public.guilds SET "social.achieve" = $2, "social.achieve-message" = $3, $2 WHERE id = $1;`,
					[entry.id, true, this.transformToOld(message)]
				);
			}
		}

		await queryRunner.dropColumn('guilds', 'social.achieve-role');
		await queryRunner.dropColumn('guilds', 'social.achieve-level');
		await queryRunner.dropColumn('guilds', 'social.achieve-channel');
		await queryRunner.dropColumn('guilds', 'social.achieve-multiple');
	}

	private transformToNew(content: string): string {
		return content.replace(this.oldRegExp, (match) => {
			switch (match) {
				case '%ROLE%':
					return '{role.name}';
				case '%MEMBER%':
					return '{member}';
				case '%MEMBERNAME%':
					return '{member.username}';
				case '%GUILD%':
					return '{server}';
				case '%POINTS%':
					return '{points}';
				default:
					return match;
			}
		});
	}

	private transformToOld(content: string): string {
		return content.replace(this.newRegExp, (match) => {
			switch (match) {
				case '{role.name}':
					return '%ROLE%';
				case '{member}':
					return '%MEMBER%';
				case '{member.username}':
					return '%MEMBERNAME%';
				case '{server}':
					return '%GUILD%';
				case '{points}':
					return '%POINTS%';
				default:
					return match;
			}
		});
	}
}

interface OldEntry {
	id: string;
	'social.achieve': boolean;
	'social.achieve-message': string | null;
}

interface NewEntry {
	id: string;
	'social.achieve-role': string | null;
}
