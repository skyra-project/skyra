import type { ISchemaValue } from './base/ISchemaValue';
import type { SchemaGroup } from './schema/SchemaGroup';
import type { SchemaKey } from './schema/SchemaKey';

export function isSchemaGroup(groupOrKey: ISchemaValue): groupOrKey is SchemaGroup {
	return groupOrKey.type === 'Group';
}

export function isSchemaKey(groupOrKey: ISchemaValue): groupOrKey is SchemaKey {
	return groupOrKey.type !== 'Group';
}
