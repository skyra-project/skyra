import { AuditMeasurements, AuditTags } from '@lib/types/influxSchema/Audit';
import { Databases } from '@lib/types/influxSchema/database';
import { Tags } from '@lib/types/influxSchema/tags';
import { FieldType, ISchemaOptions } from 'influx';

export const SchemaSettingsUpdate: ISchemaOptions = {
	database: Databases.Audits,
	measurement: AuditMeasurements.SettingsUpdate,
	fields: {
		key: FieldType.STRING,
		value: FieldType.STRING
	},
	tags: [
		Tags.Shard,
		AuditTags.By,
		AuditTags.Target,

		Tags.Guild,
		Tags.Client,
		Tags.User
	]
};

export const SchemaAnnouncement: ISchemaOptions = {
	database: Databases.Audits,
	measurement: AuditMeasurements.Announcement,
	fields: {
		content: FieldType.STRING,

		role_id: FieldType.STRING,
		role_name: FieldType.STRING,

		message_source_id: FieldType.STRING,
		message_result_id: FieldType.STRING
	},
	tags: [
		Tags.Shard,
		Tags.User,
		Tags.Channel,
		Tags.Guild,
		AuditTags.Action
	]
};
