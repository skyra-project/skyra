import { ISchemaOptions, FieldType } from 'influx';
import { INFLUX_AUDIT_DATABASE } from '../../../config';
import { Tags } from '../types/influxSchema/tags';
import { AuditMeasurements, AuditTags } from '../types/influxSchema/Audit';

export const SchemaSettingsUpdate: ISchemaOptions = {
	database: INFLUX_AUDIT_DATABASE,
	measurement: AuditMeasurements.SettingsUpdate,
	fields: {
		key: FieldType.STRING,
		old_value: FieldType.STRING,
		new_value: FieldType.STRING
	},
	tags: [
		Tags.Shard,
		AuditTags.Target,

		Tags.Guild,
		Tags.Client,
		Tags.User
	]
};
