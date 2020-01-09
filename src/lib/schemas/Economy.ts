import { ISchemaOptions, FieldType } from 'influx';
import { Tags } from '../types/influxSchema/tags';
import { Databases } from '../types/influxSchema/database';
import { EconomyMeasurements, EconomyTags } from '../types/influxSchema/Economy';

export const SchemaMoneyTransaction: ISchemaOptions = {
	database: Databases.Economy,
	measurement: EconomyMeasurements.Transaction,
	fields: {
		change: FieldType.INTEGER,
		balance: FieldType.INTEGER,
		old_balance: FieldType.INTEGER
	},
	tags: [
		Tags.Shard,
		Tags.User,
		EconomyTags.Action,
		EconomyTags.Reason
	]
};

export const SchemaMoneyPayment: ISchemaOptions = {
	database: Databases.Economy,
	measurement: EconomyMeasurements.Payment,
	fields: {
		amount: FieldType.INTEGER
	},
	tags: [
		Tags.Shard,
		Tags.Message,
		Tags.User,
		EconomyTags.Target
	]
};
