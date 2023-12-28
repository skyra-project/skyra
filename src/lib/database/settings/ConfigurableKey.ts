import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import { SchemaGroup, type NonEmptyArray } from '#lib/database/settings/schema/SchemaGroup';
import { SchemaKey, type ConfigurableKeyValueOptions } from '#lib/database/settings/schema/SchemaKey';
import { isFunction, isNumber, isPrimitive } from '@sapphire/utilities';
import { Collection } from 'discord.js';
import { getMetadataArgsStorage, type ColumnOptions, type ColumnType } from 'typeorm';

export const configurableKeys = new Collection<string, SchemaKey>();
export const configurableGroups = new SchemaGroup();

export function ConfigurableKey(options: ConfigurableKeyOptions): PropertyDecorator {
	return (target, property) => {
		const storage = getMetadataArgsStorage();
		const column = storage.columns.find((c) => c.target === target.constructor && c.propertyName === (property as string));
		if (!column) throw new Error('Cannot find the metadata column.');

		const name = (options.name ?? column.options.name) as keyof GuildEntity;
		if (typeof name === 'undefined') throw new TypeError('The option "name" must be specified.');

		const array = options.array ?? column.options.array ?? false;
		const inclusive = options.inclusive ?? true;
		const minimum = options.minimum ?? null;
		const maximum = options.maximum ?? hydrateLength(column.options.length);
		const type = options.type?.toLowerCase() ?? hydrateType(column.options.type!);
		const df = options.default ?? getDefault(column.options, array, minimum);
		const dashboardOnly = options.dashboardOnly ?? false;
		const value = new SchemaKey({
			target: target.constructor,
			property: property as keyof GuildEntity,
			...options,
			array,
			default: df,
			inclusive,
			maximum,
			minimum,
			name,
			type,
			dashboardOnly
		});

		configurableKeys.set(property as keyof GuildEntity, value);
		value.parent = configurableGroups.add(name.split('.') as NonEmptyArray<string>, value);
	};
}

function getDefault(options: ColumnOptions, array: boolean, minimum: number | null) {
	if (isPrimitive(options.default)) return options.default;
	if (array) return [];
	if (isNumber(minimum)) return minimum;
	if (options.nullable) return null;
	if (isFunction(options.default) && options.default() === "'[]'::JSONB") return [];
	throw new TypeError(`The default value for the column '${options.name}' cannot be obtained automatically.`);
}

function hydrateLength(length: string | number | undefined) {
	if (typeof length === 'string') return Number(length);
	if (typeof length === 'number') return length;
	return null;
}

function hydrateType(type: ColumnType) {
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (type) {
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'float':
		case 'jsonb':
		case 'string': {
			return type;
		}

		case 'long':
		case 'int2':
		case 'integer':
		case 'int4':
		case 'int8':
		case 'int64':
		case 'unsigned big int':
		case 'tinyint':
		case 'smallint':
		case 'mediumint':
		case 'int': {
			return 'integer';
		}

		case 'float4':
		case 'float8':
		case 'smallmoney':
		case 'money':
		case 'real':
		case 'numeric':
		case 'double precision':
		case 'double': {
			return 'number';
		}

		case 'text':
		case 'nvarchar':
		case 'national varchar':
		case 'varchar':
		case 'varchar2':
		case 'nvarchar2':
		case 'shorttext':
		case 'character varying':
		case 'varying character':
		case 'char varying': {
			return 'string';
		}

		case 'bool': {
			return 'boolean';
		}

		case 'smalldatetime':
		case 'date':
		case 'interval year to month':
		case 'interval day to second':
		case 'interval':
		case 'year':
		case 'datetime':
		case 'datetime2':
		case 'time':
		case 'time with time zone':
		case 'time without time zone':
		case 'timestamp':
		case 'timestamp without time zone':
		case 'timestamp with time zone':
		case 'timestamp with local time zone': {
			return 'date';
		}

		case 'character':
		case 'native character':
		case 'char':
		case 'nchar':
		case 'national char': {
			return 'character';
		}

		default: {
			throw new Error(`Unsupported type ${type}`);
		}
	}
}

type OptionalKeys = 'name' | 'type' | 'inclusive' | 'maximum' | 'minimum' | 'array' | 'default' | 'dashboardOnly';
type ConfigurableKeyOptions = Omit<ConfigurableKeyValueOptions, 'target' | 'property' | OptionalKeys> &
	Partial<Pick<ConfigurableKeyValueOptions, OptionalKeys>>;
