import { isNullish, type Nullish } from '@sapphire/utilities';
import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V54EventsModernization1626169505546 implements MigrationInterface {
	private readonly oldChannelKeys = ['channels.logs.member', 'channels.logs.message', 'channels.logs.nsfw-message'] as const;
	private readonly oldEventKeys = [
		'events.member-add',
		'events.member-remove',
		'events.member-nickname-update',
		'events.member-username-update',
		'events.member-role-update',
		'events.message-delete',
		'events.message-edit'
	] as const;

	private readonly oldKeys = [...this.oldChannelKeys, ...this.oldEventKeys] as const;

	private readonly newKeys = [
		'channels.logs.member-add',
		'channels.logs.member-remove',
		'channels.logs.member-nickname-update',
		'channels.logs.member-username-update',
		'channels.logs.member-roles-update',
		'channels.logs.message-delete',
		'channels.logs.message-delete-nsfw',
		'channels.logs.message-update',
		'channels.logs.message-update-nsfw'
	] as const;

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.newKeys) {
			await queryRunner.addColumn('guilds', new TableColumn({ name: key, type: 'varchar', length: '19', isNullable: true }));
		}

		const entries = (await queryRunner.query(/* sql */ `
			SELECT
				"id",
				"channels.logs.member",
				"channels.logs.message",
				"channels.logs.nsfw-message",
				"events.member-add",
				"events.member-remove",
				"events.member-nickname-update",
				"events.member-username-update",
				"events.member-role-update",
				"events.message-delete",
				"events.message-edit"
			FROM public.guilds
			WHERE
				"channels.logs.member" IS NOT NULL OR
				"channels.logs.message" IS NOT NULL OR
				"channels.logs.nsfw-message" IS NOT NULL;`)) as OldEntry[];

		for (const entry of entries) {
			const newEntry = this.updateToNew(entry);
			const values = [
				entry.id,
				newEntry['channels.logs.member-add'],
				newEntry['channels.logs.member-remove'],
				newEntry['channels.logs.member-nickname-update'],
				newEntry['channels.logs.member-username-update'],
				newEntry['channels.logs.member-roles-update'],
				newEntry['channels.logs.message-delete'],
				newEntry['channels.logs.message-delete-nsfw'],
				newEntry['channels.logs.message-update'],
				newEntry['channels.logs.message-update-nsfw']
			];

			await queryRunner.query(
				/* sql */ `
				UPDATE public.guilds
				SET
					"channels.logs.member-add" = $2,
					"channels.logs.member-remove" = $3,
					"channels.logs.member-nickname-update" = $4,
					"channels.logs.member-username-update" = $5,
					"channels.logs.member-roles-update" = $6,
					"channels.logs.message-delete" = $7,
					"channels.logs.message-delete-nsfw" = $8,
					"channels.logs.message-update" = $9,
					"channels.logs.message-update-nsfw" = $10
				WHERE id = $1;`,
				values
			);
		}

		for (const key of this.oldKeys) {
			await queryRunner.dropColumn('guilds', key);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const key of this.oldChannelKeys) {
			await queryRunner.addColumn('guilds', new TableColumn({ name: key, type: 'varchar', length: '19', isNullable: true }));
		}

		for (const key of this.oldEventKeys) {
			await queryRunner.addColumn('guilds', new TableColumn({ name: key, type: 'boolean', default: 'false' }));
		}

		const entries = (await queryRunner.query(/* sql */ `
			SELECT
				"id",
				"channels.logs.member-add",
				"channels.logs.member-remove",
				"channels.logs.member-nickname-update",
				"channels.logs.member-username-update",
				"channels.logs.member-roles-update",
				"channels.logs.message-delete",
				"channels.logs.message-delete-nsfw",
				"channels.logs.message-update",
				"channels.logs.message-update-nsfw"
			FROM public.guilds
			WHERE
				"channels.logs.member-add" IS NOT NULL OR
				"channels.logs.member-remove" IS NOT NULL OR
				"channels.logs.member-nickname-update" IS NOT NULL OR
				"channels.logs.member-username-update" IS NOT NULL OR
				"channels.logs.member-roles-update" IS NOT NULL OR
				"channels.logs.message-delete" IS NOT NULL OR
				"channels.logs.message-delete-nsfw" IS NOT NULL OR
				"channels.logs.message-update" IS NOT NULL OR
				"channels.logs.message-update-nsfw" IS NOT NULL;`)) as NewEntry[];

		for (const entry of entries) {
			const oldEntry = this.updateToOld(entry);
			const values = [
				entry.id,
				oldEntry['channels.logs.member'],
				oldEntry['channels.logs.message'],
				oldEntry['channels.logs.nsfw-message'],
				oldEntry['events.member-add'],
				oldEntry['events.member-remove'],
				oldEntry['events.member-nickname-update'],
				oldEntry['events.member-username-update'],
				oldEntry['events.member-role-update'],
				oldEntry['events.message-delete'],
				oldEntry['events.message-edit']
			];

			await queryRunner.query(
				/* sql */ `
				UPDATE public.guilds
				SET
					"channels.logs.member" = $2,
					"channels.logs.message" = $3,
					"channels.logs.nsfw-message" = $4,
					"events.member-add" = $5,
					"events.member-remove" = $6,
					"events.member-nickname-update" = $7,
					"events.member-username-update" = $8,
					"events.member-role-update" = $9,
					"events.message-delete" = $10,
					"events.message-edit" = $11
				WHERE id = $1;`,
				values
			);
		}

		for (const key of this.newKeys) {
			await queryRunner.dropColumn('guilds', key);
		}
	}

	private updateToNew(entry: OldEntry): NewEntry {
		return {
			id: entry.id,
			'channels.logs.member-add': entry['events.member-add'] ? entry['channels.logs.member'] : null,
			'channels.logs.member-remove': entry['events.member-remove'] ? entry['channels.logs.member'] : null,
			'channels.logs.member-nickname-update': entry['events.member-nickname-update'] ? entry['channels.logs.member'] : null,
			'channels.logs.member-username-update': entry['events.member-username-update'] ? entry['channels.logs.member'] : null,
			'channels.logs.member-roles-update': entry['events.member-role-update'] ? entry['channels.logs.member'] : null,
			'channels.logs.message-delete': entry['events.message-delete'] ? entry['channels.logs.message'] : null,
			'channels.logs.message-delete-nsfw': entry['events.message-delete'] ? entry['channels.logs.nsfw-message'] : null,
			'channels.logs.message-update': entry['events.message-edit'] ? entry['channels.logs.message'] : null,
			'channels.logs.message-update-nsfw': entry['events.message-edit'] ? entry['channels.logs.nsfw-message'] : null
		};
	}

	private updateToOld(entry: NewEntry): OldEntry {
		return {
			id: entry.id,
			'channels.logs.member':
				entry['channels.logs.member-add'] ??
				entry['channels.logs.member-remove'] ??
				entry['channels.logs.member-roles-update'] ??
				entry['channels.logs.member-nickname-update'] ??
				entry['channels.logs.member-username-update'],
			'channels.logs.message': entry['channels.logs.message-update'] ?? entry['channels.logs.message-delete'],
			'channels.logs.nsfw-message': entry['channels.logs.message-update-nsfw'] ?? entry['channels.logs.message-delete-nsfw'],
			'events.member-add': !isNullish(entry['channels.logs.member-add']),
			'events.member-remove': !isNullish(entry['channels.logs.member-remove']),
			'events.member-nickname-update': !isNullish(entry['channels.logs.member-nickname-update']),
			'events.member-username-update': !isNullish(entry['channels.logs.member-username-update']),
			'events.member-role-update': !isNullish(entry['channels.logs.member-roles-update']),
			'events.message-delete': !isNullish(entry['channels.logs.message-delete'] ?? entry['channels.logs.message-delete-nsfw']),
			'events.message-edit': !isNullish(entry['channels.logs.message-update'] ?? entry['channels.logs.message-update-nsfw'])
		};
	}
}

interface OldEntry {
	id: string;
	'channels.logs.member': string | Nullish;
	'channels.logs.message': string | Nullish;
	'channels.logs.nsfw-message': string | Nullish;
	'events.member-add': boolean;
	'events.member-remove': boolean;
	'events.member-nickname-update': boolean;
	'events.member-username-update': boolean;
	'events.member-role-update': boolean;
	'events.message-delete': boolean;
	'events.message-edit': boolean;
}

interface NewEntry {
	id: string;
	'channels.logs.member-add': string | Nullish;
	'channels.logs.member-remove': string | Nullish;
	'channels.logs.member-nickname-update': string | Nullish;
	'channels.logs.member-username-update': string | Nullish;
	'channels.logs.member-roles-update': string | Nullish;
	'channels.logs.message-delete': string | Nullish;
	'channels.logs.message-delete-nsfw': string | Nullish;
	'channels.logs.message-update': string | Nullish;
	'channels.logs.message-update-nsfw': string | Nullish;
}
