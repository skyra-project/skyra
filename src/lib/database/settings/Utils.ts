import { ISchemaValue } from './base/ISchemaValue';
import { SchemaGroup } from './schema/SchemaGroup';
import { SchemaKey } from './schema/SchemaKey';

export function isSchemaGroup(groupOrKey: ISchemaValue): groupOrKey is SchemaGroup {
	return groupOrKey.type === 'Group';
}

export function isSchemaKey(groupOrKey: ISchemaValue): groupOrKey is SchemaKey {
	return groupOrKey.type !== 'Group';
}
