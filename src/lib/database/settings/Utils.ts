import { ISchemaValue } from './base/ISchemaValue';
import { SchemaGroup } from './schema/SchemaGroup';
import { SchemaKey } from './schema/SchemaKey';

// TODO: Rename those to `isSchemaGroup` and `isSchemaKey`
export function isSchemaFolder(schemaOrEntry: ISchemaValue): schemaOrEntry is SchemaGroup {
	return schemaOrEntry.type === 'Group';
}

export function isSchemaEntry(schemaOrEntry: ISchemaValue): schemaOrEntry is SchemaKey {
	return schemaOrEntry.type !== 'Group';
}
