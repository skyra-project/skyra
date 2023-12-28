import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V01MigrateClientStorage1594413973851 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateClient(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('client');
		await queryRunner.dropTable('schedule');
	}

	private async migrateClient(queryRunner: QueryRunner): Promise<void> {
		// Create the new client table
		await queryRunner.createTable(
			new Table({
				name: 'client',
				columns: [
					new TableColumn({
						name: 'id',
						type: 'varchar',
						length: '19',
						default: `'${process.env.CLIENT_ID}'`,
						isNullable: false,
						isPrimary: true
					}),
					new TableColumn({ name: 'user_blocklist', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'user_boost', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'guild_blocklist', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({ name: 'guild_boost', type: 'varchar', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
				]
			})
		);

		// Create the new schedule table
		await queryRunner.createTable(
			new Table({
				name: 'schedule',
				columns: [
					new TableColumn({
						name: 'id',
						type: 'integer',
						isPrimary: true,
						isNullable: false,
						isGenerated: true,
						generationStrategy: 'increment',
						comment: 'ID for a scheduled task'
					}),
					new TableColumn({ name: 'task_id', type: 'varchar', isNullable: false, comment: 'Name of the task that will run' }),
					new TableColumn({
						name: 'time',
						type: 'timestamp without time zone',
						isNullable: false,
						comment: 'Date when scheduled task ends'
					}),
					new TableColumn({
						name: 'recurring',
						type: 'varchar',
						isNullable: true,
						default: null,
						comment: 'Whether the scheduled task is scheduled with a cron pattern'
					}),
					new TableColumn({
						name: 'catch_up',
						type: 'boolean',
						isNullable: false,
						default: true,
						comment: 'Whether the task should catch up in event the bot is down'
					}),
					new TableColumn({ name: 'data', type: 'jsonb', isNullable: false, comment: 'The stored metadata to send to the task' })
				]
			})
		);

		// Get the data from the "clientStorage" table and transform it into Client entities
		// Quotes around table name are required here
		const { clientEntities, scheduleEntities } = transformClientStorage(
			await queryRunner.query(/* sql */ `SELECT * FROM public."clientStorage";`)
		);

		// Save the new Client entities to the database
		const stringifiedClientData = JSON.stringify(clientEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.client
			SELECT * FROM json_populate_recordset(NULL::public.client, '${stringifiedClientData}')
			ON CONFLICT DO NOTHING;
		`);

		// Save the new Schedule entities to the database
		const stringifiedScheduleData = JSON.stringify(scheduleEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.schedule
			SELECT * FROM json_populate_recordset(NULL::public.schedule, '${stringifiedScheduleData}')
			ON CONFLICT DO NOTHING;
		`);
	}
}

function transformClientStorage(clientStorage: ClientStorage[]): {
	clientEntities: TransformedClientStorage[];
	scheduleEntities: TransformedSchedule[];
} {
	const scheduleEntities: TransformedSchedule[] = [];
	const clientEntities: TransformedClientStorage[] = [];

	for (const cs of clientStorage) {
		clientEntities.push({
			id: cs.id,
			user_blocklist: cs.userBlacklist,
			user_boost: cs.boosts_users,
			guild_blocklist: cs.guildBlacklist,
			guild_boost: cs.boosts_guilds
		});

		for (const schedule of cs.schedules) {
			if (schedule.time >= 1640995200000) continue;

			scheduleEntities.push({
				id: scheduleEntities.length.toString(),
				data: schedule.data,
				catch_up: schedule.catchUp,
				task_id: schedule.taskName,
				repeat: schedule.repeat,
				time: new Date(schedule.time),
				recurring: schedule.recurring
			});
		}
	}

	return { clientEntities, scheduleEntities };
}

interface Schedule {
	catchUp: boolean;
	taskName: string;
	data: Record<string, unknown>;
	id: string;
	time: number;
	repeat: string;
	recurring?: unknown | null;
}

interface TransformedSchedule extends Omit<Schedule, 'catchUp' | 'taskName' | 'time'> {
	catch_up: boolean;
	task_id: string;
	time: Date;
}

interface ClientStorage {
	id: string;
	userBlacklist: string[];
	guildBlacklist: string[];
	boosts_guilds: string[];
	boosts_users: string[];
	schedules: Schedule[];
	commandUses: number;
}

interface TransformedClientStorage extends Pick<ClientStorage, 'id'> {
	user_blocklist: string[];
	user_boost: string[];
	guild_blocklist: string[];
	guild_boost: string[];
}
