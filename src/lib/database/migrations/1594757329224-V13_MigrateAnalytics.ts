import { Actions, CommandCategoryTypes, Points, Tags } from '#lib/types/AnalyticsSchema';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { BucketsAPI } from '@influxdata/influxdb-client-apis';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Table, TableCheck, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

const CATEGORIES_FILE = '1594757329224-V13_MigrateAnalytics.json';
const INFLUX_ALL_COMMANDS_SCRIPT = `from(bucket: "${process.env.INFLUX_ORG_ANALYTICS_BUCKET}") |> range(start: 0) |> filter(fn: (r) => r["_measurement"] == "commands") |> sum(column: "_value")`;

/**
 * Since I believe in the competence of this dev team.
 * I decided to remove the check for if the bucket exists under "up"
 */
export class V13MigrateAnalytics1594757329224 implements MigrationInterface {
	private migStart: Date = new Date();

	public async up(queryRunner: QueryRunner): Promise<void> {
		const categories = new Map<string, CategoryData>(JSON.parse(await readFile(join(__dirname, CATEGORIES_FILE), 'utf-8')));

		const influx = new InfluxDB(process.env.INFLUX_URL);
		const writer = influx.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_ORG_ANALYTICS_BUCKET, 's');

		const commandUses: CommandUsageStats = await queryRunner.query(/* sql */ `SELECT * FROM command_counter;`);

		const points: Point[] = [];
		for await (const commandUse of commandUses) {
			if (commandUse.uses === 0) continue;
			points.push(this.createPoint(commandUse.id, commandUse.uses, categories.get(commandUse.id) ?? { category: 'General' }));
		}

		writer.writePoints(points);
		await writer.flush();
		await writer.close();

		await queryRunner.dropTable('command_counter');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const influx = new InfluxDB(process.env.INFLUX_URL);
		const bucketAPI = new BucketsAPI(influx);
		const buckets = await bucketAPI.getBuckets();
		const reader = influx.getQueryApi(process.env.INFLUX_ORG);

		if (!buckets.buckets?.some((bucket) => bucket.name === process.env.INFLUX_ORG_ANALYTICS_BUCKET)) return;

		const commands = await reader.collectRows<InfluxSummedCommandEntry>(INFLUX_ALL_COMMANDS_SCRIPT);

		await queryRunner.createTable(
			new Table({
				name: 'command_counter',
				checks: [new TableCheck({ expression: /* sql */ `"uses" >= 0` })],
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '32', isPrimary: true }),
					new TableColumn({ name: 'uses', type: 'integer', default: 0, isNullable: false })
				]
			})
		);

		for (const command of commands) {
			await queryRunner.query(
				/* sql */ `
				INSERT
				INTO command_counter ("id", "uses")
				VALUES ($1, $2)
				ON CONFLICT (id)
				DO
					UPDATE
					SET uses = command_counter.uses + $2;
			`,
				[command._field, Number(command._value)]
			);
		}
	}

	private createPoint(commandName: string, commandUsageAmount: number, categoryData: CategoryData) {
		return new Point(Points.Commands)
			.tag(Tags.Action, Actions.Addition)
			.tag(Tags.MigrationName, this.constructor.name)
			.tag(CommandCategoryTypes.Category, categoryData.category)
			.timestamp(this.migStart)
			.intField(commandName.replace(/^time$/, 'case-time'), commandUsageAmount);
	}
}

interface InfluxSummedCommandEntry {
	result: '_result';
	table: string;
	_start: string;
	_stop: string;
	_field: string;
	_measurement: Points.Commands;
	action: Actions;
	category: string;
	client_id: string;
	origin_event: string;
	subCategory: string;
	_value: string;
}

type CommandUsageStats = CommandUsage[];

interface CommandUsage {
	id: string;
	uses: number;
}

interface CategoryData {
	category: string;
}
