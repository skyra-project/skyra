import { ISchemaOptions, FieldType } from 'influx';
import { Tags } from '../types/influxSchema/tags';
import { Databases } from '../types/influxSchema/database';
import { EconomyMeasurements } from '../types/influxSchema/Economy';

// TODO(Quantum): Implement proper data
export const SchemaMoneyTransaction: ISchemaOptions = {
	database: Databases.Economy,
	measurement: EconomyMeasurements.Transaction,
	fields: {
		key: FieldType.STRING,
		old_value: FieldType.STRING,
		new_value: FieldType.STRING
	},
	tags: [
		Tags.Shard
	]
};

// TODO(Quantum): Implement payment data structure
