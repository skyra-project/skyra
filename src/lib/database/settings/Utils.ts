import { ISchemaValue } from './base/ISchemaValue';
import { SchemaGroup } from './schema/SchemaGroup';
import { SchemaKey } from './schema/SchemaKey';

export function isSchemaFolder(schemaOrEntry: ISchemaValue): schemaOrEntry is SchemaGroup {
	return schemaOrEntry.type === 'Folder';
}

export function isSchemaEntry(schemaOrEntry: ISchemaValue): schemaOrEntry is SchemaKey {
	return schemaOrEntry.type !== 'Folder';
}
