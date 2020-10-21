import { ColumnType, getMetadataArgsStorage } from 'typeorm';
import { ConfigurableKeyValue, ConfigurableKeyValueOptions } from './ConfigurableKeyValue';

export const keys = new Map<string, ConfigurableKeyValue>();

export function ConfigurableKey(options: ConfigurableKeyOptions): PropertyDecorator {
	return (target, property) => {
		const storage = getMetadataArgsStorage();
		const column = storage.columns.find((c) => c.target === target.constructor && c.propertyName === (property as string));
		if (!column) throw new Error('Cannot find the metadata column.');

		const name = options.name ?? column.options.name;
		if (typeof name === 'undefined') throw new TypeError('The option "name" must be specified.');

		const array = options.array ?? column.options.array ?? false;
		const minimum = options.minimum ?? null;
		const maximum = options.maximum ?? hydrateLength(column.options.length);
		const type = options.type ?? hydrateType(column.options.type!);
		keys.set(
			name,
			new ConfigurableKeyValue({ target: target.constructor, property: property as string, ...options, name, array, minimum, maximum, type })
		);
	};
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

type ConfigurableKeyOptions = Omit<ConfigurableKeyValueOptions, 'name' | 'target' | 'property' | 'type' | 'maximum' | 'minimum' | 'array'> &
	Partial<Pick<ConfigurableKeyValueOptions, 'name' | 'type' | 'maximum' | 'minimum' | 'array'>>;
