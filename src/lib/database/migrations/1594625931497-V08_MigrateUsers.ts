import { Table, TableColumn, TableForeignKey, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V08MigrateUsers1594625931497 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user',
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '19', isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'points', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'reputations', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'moderation_dm', type: 'boolean', isNullable: false, default: true }),
					new TableColumn({ name: 'money', type: 'bigint', isNullable: false, default: 0 })
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'user_profile',
				columns: [
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'banners', type: 'varchar', isNullable: false, isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'public_badges', type: 'varchar', isNullable: false, isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'badges', type: 'varchar', isNullable: false, isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'color', type: 'integer', isNullable: false, default: 0 }),
					new TableColumn({ name: 'vault', type: 'bigint', isNullable: false, default: 0 }),
					new TableColumn({ name: 'banner_level', type: 'varchar', isNullable: false, default: '1001' }),
					new TableColumn({ name: 'banner_profile', type: 'varchar', isNullable: false, default: '0001' }),
					new TableColumn({ name: 'dark_theme', type: 'boolean', isNullable: false, default: false })
				],
				foreignKeys: [
					new TableForeignKey({
						columnNames: ['user_id'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE'
					})
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'user_cooldown',
				columns: [
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'daily', type: 'timestamp without time zone', isNullable: true }),
					new TableColumn({ name: 'reputation', type: 'timestamp without time zone', isNullable: true })
				],
				foreignKeys: [
					new TableForeignKey({
						columnNames: ['user_id'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE'
					})
				]
			})
		);

		// Get the data from the "users" table and transform it into User and UserProfile entities
		const { userEntities, userProfileEntities } = transformUser(await queryRunner.query(/* sql */ `SELECT * FROM public.users;`));

		// Save the new User entities to the database
		const stringifiedUserData = JSON.stringify(userEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.user
			SELECT * FROM json_populate_recordset(NULL::public.user, '${stringifiedUserData}')
			ON CONFLICT DO NOTHING;
		`);

		// Save the new UserProfile entities to the database
		const stringifiedUserProfileData = JSON.stringify(userProfileEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.user_profile
			SELECT * FROM json_populate_recordset(NULL::public.user_profile, '${stringifiedUserProfileData}')
			ON CONFLICT DO NOTHING;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('user');
		await queryRunner.dropTable('user_profile');
	}
}

function transformUser(users: User[]): { userEntities: TransformedUser[]; userProfileEntities: TransformedUserProfile[] } {
	const userEntities: TransformedUser[] = [];
	const userProfileEntities: TransformedUserProfile[] = [];

	for (const user of users) {
		userEntities.push({
			id: user.id,
			moderation_dm: user.moderation_dm,
			money: Number(user.money),
			points: Number(user.point_count),
			reputations: user.reputation_count
		});

		if (!isUserProfileAllDefaults(user)) {
			userProfileEntities.push({
				user_id: user.id,
				badges: user.badge_list,
				banner_level: user.theme_level,
				banner_profile: user.theme_profile,
				banners: user.banner_list,
				color: user.color,
				dark_theme: user.dark_theme,
				public_badges: user.badge_set,
				vault: user.vault
			});
		}
	}

	return { userEntities, userProfileEntities };
}

function isUserProfileAllDefaults(user: User) {
	return (
		user.badge_list.length === 0 &&
		user.theme_level === '1001' &&
		user.theme_profile === '0001' &&
		user.banner_list.length === 0 &&
		user.color === 0 &&
		user.badge_set.length === 0 &&
		user.vault === 0 &&
		!user.dark_theme
	);
}

interface User {
	id: string;
	command_uses: number;
	banner_list: string[];
	badge_set: string[];
	badge_list: string[];
	color: number;
	marry: string[];
	money: string;
	point_count: number;
	reputation_count: number;
	theme_level: string;
	theme_profile: string;
	next_daily: string;
	dark_theme: boolean;
	moderation_dm: boolean;
	vault: number;
}

interface TransformedUser {
	id: string;
	points: number;
	reputations: number;
	moderation_dm: boolean;
	money: number;
}

interface TransformedUserProfile {
	user_id: string;
	banners: string[];
	public_badges: string[];
	badges: string[];
	color: number;
	vault: number;
	banner_level: string;
	banner_profile: string;
	dark_theme: boolean;
}
