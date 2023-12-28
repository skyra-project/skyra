import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V19MigrateReactionRoles1596299849081 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create the new column:
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'reaction-roles', type: 'JSON', isArray: true, default: 'ARRAY[]::JSON[]' }));

		// Read all entries and insert the values to the new column:
		const entries = (await queryRunner.query(
			/* sql */ `SELECT id, "channels.roles", "roles.messageReaction", "roles.reactions" FROM public.guilds;`
		)) as RawData[];
		for (const entry of entries) {
			// If no reactions were set or no there wasn't a configured channel, skip.
			if (!entry['roles.reactions'].length || !entry['channels.roles']) continue;

			const reactionRoles: ReactionRole[] = [];
			for (const value of entry['roles.reactions']) {
				reactionRoles.push({
					role: value.role,
					emoji: value.emoji,
					channel: entry['channels.roles'],
					message: entry['roles.messageReaction']
				});
			}

			const escaped = reactionRoles.map((value) => `'${JSON.stringify(value).replace(/'/g, "''")}'`);
			const escapedId = entry.id.replace(/'/g, "''");
			await queryRunner.query(/* sql */ `UPDATE public.guilds SET "reaction-roles" = ARRAY[${escaped}]::JSON[] WHERE id = '${escapedId}';`);
		}

		// Drop the old columns:
		await queryRunner.dropColumn('guilds', 'channels.roles');
		await queryRunner.dropColumn('guilds', 'roles.messageReaction');
		await queryRunner.dropColumn('guilds', 'roles.reactions');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Create the old columns:
		await queryRunner.addColumns('guilds', [
			new TableColumn({ name: 'channels.roles', type: 'varchar', length: '19', isNullable: true }),
			new TableColumn({ name: 'roles.messageReaction', type: 'varchar', length: '19', isNullable: true }),
			new TableColumn({ name: 'roles.reactions', type: 'JSON', isArray: true, default: 'ARRAY[]::JSON[]' })
		]);

		// Drop the new column:
		await queryRunner.dropColumn('guilds', 'reaction-roles');
	}
}

interface ReactionRole {
	role: string;
	emoji: string;
	message: string | null;
	channel: string;
}

interface RawData {
	id: string;
	'channels.roles': string;
	'roles.messageReaction': string | null;
	'roles.reactions': {
		emoji: string;
		role: string;
	}[];
}
