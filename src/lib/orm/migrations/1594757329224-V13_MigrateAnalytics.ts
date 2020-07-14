import { InfluxDB, Point, WritePrecision } from '@influxdata/influxdb-client';
import {
	INFLUX_OPTIONS,
	INFLUX_ORG,
	INFLUX_ORG_ANALYTICS_BUCKET
} from '@root/config';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { readJson } from 'fs-nextra';
import { join } from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

const CATEGORIES_FILE = '1594757329224-V13_MigrateAnalytics.json';

export class V13MigrateAnalytics1594757329224 implements MigrationInterface {

	private migStart: Date = new Date();

	public async up(queryRunner: QueryRunner): Promise<void> {
		const categoriesRaw: CategoriesListEntry[] = await readJson(join('.', CATEGORIES_FILE));
		const categories = new Map(categoriesRaw);

		const influx = new InfluxDB(INFLUX_OPTIONS);
		const writer = influx.getWriteApi(INFLUX_ORG, INFLUX_ORG_ANALYTICS_BUCKET, WritePrecision.s);

		const commandUses: CommandUsageStats = await queryRunner.query('SELECT * FROM command_counter');

		const points: Point[] = [];
		for await (const commandUse of commandUses) {
			if (commandUse.uses === 0) continue;
			points.push(this.createPoint(commandUse.id, commandUse.uses, categories.get(commandUse.id)!));
		}

		writer.writePoints(points);
		await writer.flush();
		await writer.close();

		await queryRunner.dropTable('command_counter');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const influx = new InfluxDB(INFLUX_OPTIONS);
		const reader = influx.getQueryApi(INFLUX_ORG);
	}

	private createPoint(commandName: string, commandUsageAmount: number, categoryData: CategoryData) {
		return new Point(AnalyticsSchema.Points.Commands)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			.tag(AnalyticsSchema.Tags.MigrationName, this.constructor.name)
			.tag(AnalyticsSchema.CommandTags.Category, categoryData.category)
			.tag(AnalyticsSchema.CommandTags.SubCategory, categoryData.subCategory)
			.timestamp(this.migStart)
			.intField(commandName, commandUsageAmount);
	}

}

type CommandUsageStats = CommandUsage[];

interface CommandUsage {
	id: string;
	uses: number;
}

interface CategoryData {
	category: string;
	subCategory: string;
}

type CategoriesListEntry = [string, CategoryData];
