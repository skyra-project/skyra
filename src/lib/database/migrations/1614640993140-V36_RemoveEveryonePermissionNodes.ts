import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V36RemoveEveryonePermissionNodes1614640993140 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const rows = (await queryRunner.query(
			/* sql */ `SELECT "id", "permissions.roles" FROM public.guilds WHERE jsonb_array_length("permissions.roles") <> 0;`
		)) as Entry[];

		for (const row of rows) {
			const roles = row['permissions.roles'];
			const everyoneIndex = roles.findIndex((role) => role.id === row.id);
			if (everyoneIndex === -1) continue;

			const everyone = roles[everyoneIndex];
			if (everyone.allow.length === 0) continue;

			everyone.allow.length = 0;
			if (everyone.deny.length === 0) roles.splice(everyoneIndex, 1);
			await queryRunner.query(/* sql */ `UPDATE public.guilds SET "permissions.roles" = $2::JSONB WHERE id = $1;`, [
				row.id,
				JSON.stringify(roles)
			]);
		}
	}

	public async down(): Promise<void> {
		/* noop */
	}
}

interface Entry {
	id: string;
	'permissions.roles': PermissionsRole[];
}

interface PermissionsRole {
	id: string;
	deny: string[];
	allow: string[];
}
