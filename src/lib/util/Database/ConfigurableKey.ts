import type { CustomGet } from '@lib/types/Shared';
import type { O } from '@utils/constants';
import { ColumnType, getMetadataArgsStorage } from 'typeorm';

export const keys = new Map<string, ConfigurableKeyValue>();

export function ConfigurableKey(options: ConfigurableKeyValueOptions): PropertyDecorator {
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
		keys.set(name, { target: target.constructor, property: property as string, ...options, name, array, minimum, maximum, type });
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

interface ConfigurableKeyValue {
	/**
	 * The i18n key for the configuration key.
	 */
	description: CustomGet<string, string>;

	/**
	 * The maximum value for the configuration key.
	 */
	maximum: number | null;

	/**
	 * The minimum value for the configuration key.
	 */
	minimum: number | null;

	/**
	 * The visible name of the configuration key.
	 */
	name: string;

	/**
	 * The property from the TypeORM entity.
	 */
	property: string;

	/**
	 * The class this targets.
	 */
	target: O;

	/**
	 * The type of the value this property accepts.
	 */
	type: string;

	/**
	 * Whether or not this accepts multiple values.
	 */
	array: boolean;
}

type ConfigurableKeyValueOptions = Omit<ConfigurableKeyValue, 'name' | 'target' | 'property' | 'type' | 'maximum' | 'minimum' | 'array'> &
	Partial<Pick<ConfigurableKeyValue, 'name' | 'type' | 'maximum' | 'minimum' | 'array'>>;
