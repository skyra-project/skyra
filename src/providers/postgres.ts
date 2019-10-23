// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
import { QueryBuilder } from '@klasa/querybuilder';
import { SQLProvider, SchemaEntry, SchemaFolder, SettingsFolderUpdateResult } from 'klasa';
import { Pool, Submittable, QueryResultRow, QueryArrayConfig, QueryConfig, QueryArrayResult, QueryResult, PoolConfig } from 'pg';
import { mergeDefault } from '@klasa/utils';
import { DEV_PGSQL } from '../../config';
import { run as databaseInitRun } from '../lib/util/DatabaseInit';
import { AnyObject } from '../lib/types/util';

export default class extends SQLProvider {

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	public qb = new QueryBuilder({
		array: type => `${type}[]`,
		arraySerializer: (values, piece, resolver) =>
			values.length ? `array[${values.map(value => resolver(value, piece)).join(', ')}]` : "'{}'",
		formatDatatype: (name, datatype, def = null) => `"${name}" ${datatype}${def === null ? '' : ` NOT NULL DEFAULT ${def}`}`
	})
		.add('boolean', { type: 'BOOL' })
		.add('integer', { type: ({ max }) => max !== null && max >= 2 ** 32 ? 'BIGINT' : 'INTEGER' })
		.add('float', { type: 'DOUBLE PRECISION' })
		.add('uuid', { type: 'UUID' })
		.add('any', { type: 'JSON', serializer: input => cJson(input as AnyObject), arraySerializer: input => cArrayJson(input as AnyObject[]) })
		.add('json', { 'extends': 'any' })
		.add('permissionnode', { 'extends': 'any' });

	public pgsql: Pool | null = null;

	public async init() {
		if (!DEV_PGSQL) return this.unload();

		const poolOptions = mergeDefault<PoolConfig, PoolConfig>({
			host: 'localhost',
			port: 5432,
			database: 'klasa',
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000
		}, this.client.options.providers.postgres);

		this.pgsql = new Pool(poolOptions);
		this.pgsql.on('error', err => this.client.emit('error', err));
		await databaseInitRun(this);
	}

	public async shutdown() {
		if (this.pgsql) await this.pgsql.end();
	}

	/* Table methods */

	public async hasTable(table: string) {
		try {
			const result = await this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`);
			return result.length !== 0 && result[0].bool === true;
		} catch (e) {
			return false;
		}
	}

	public createTable(table: string, rows?: readonly [string, string][]) {
		// If rows were given, use them
		if (rows) {
			return this.run(/* sql */`
				CREATE TABLE ${cIdentifier(table)} (${rows.map(([k, v]) => `${cIdentifier(k)} ${v}`).join(', ')});
			`);
		}

		// Otherwise generate datatypes from the schema
		const gateway = this.client.gateways.get(table);
		if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

		const schemaValues = [...gateway.schema.values(true)];
		const generatedColumns = schemaValues.map(this.qb.generateDatatype.bind(this.qb));
		const columns = ['"id" VARCHAR(19) NOT NULL UNIQUE', ...generatedColumns];
		return this.run(/* sql */`
			CREATE TABLE ${cIdentifier(table)} (
				${columns.join(', ')},
				PRIMARY KEY(id)
			);
		`);
	}

	public deleteTable(table: string) {
		return this.run(/* sql */`
			DROP TABLE IF EXISTS ${cIdentifier(table)};
		`);
	}

	/* Row methods */

	public async getAll(table: string, entries: readonly string[] = []): Promise<unknown[]> {
		const filter = entries.length ? ` WHERE id IN ('${entries.join("', '")}')` : '';
		const results = await this.runAll(/* sql */`
			SELECT *
			FROM ${cIdentifier(table)}${filter};
		`);
		return results.map(output => this.parseEntry(table, output));
	}

	public async getKeys(table: string): Promise<string[]> {
		const rows = await this.runAll(/* sql */`
			SELECT id
			FROM ${cIdentifier(table)};
		`);
		return rows.map(row => row.id);
	}

	public async get(table: string, key: string, value?: unknown): Promise<unknown> {
		// If a key is given (id), swap it and search by id - value
		if (typeof value === 'undefined') {
			value = key;
			key = 'id';
		}
		const output = await this.runOne(/* sql */`
			SELECT *
			FROM ${cIdentifier(table)}
			WHERE
				${cIdentifier(key)} = $1
			LIMIT 1;
		`, [value]);
		return this.parseEntry(table, output);
	}

	public async has(table: string, id: string) {
		const result = await this.runOne(/* sql */`
			SELECT id
			FROM ${cIdentifier(table)}
			WHERE
				id = ${cString(id)}
			LIMIT 1;
		`);
		return Boolean(result);
	}

	public create(table: string, id: string, data: CreateOrUpdateValue) {
		const [keys, values] = this.parseUpdateInput(data, false);

		// Push the id to the inserts.
		if (!keys.includes('id')) {
			keys.push('id');
			values.push(id);
		}
		return this.pgsql!.query(/* sql */`
			INSERT INTO ${cIdentifier(table)} (${keys.map(cIdentifier).join(', ')})
			VALUES (${makeRange(keys.length)});
		`, values);
	}

	public update(table: string, id: string, data: CreateOrUpdateValue) {
		const [keys, values] = this.parseUpdateInput(data, false);
		return this.pgsql!.query(/* sql */`
			UPDATE ${cIdentifier(table)}
			SET ${keys.map((key, i: number) => `${cIdentifier(key)} = $${i + 1}`)}
			WHERE id = ${cString(id)};
		`, values);
	}

	public replace(table: string, id: string, data: CreateOrUpdateValue) {
		return this.update(table, id, data);
	}

	public delete(table: string, id: string) {
		return this.run(/* sql */`
			DELETE FROM ${cIdentifier(table)}
			WHERE id = ${cString(id)};
		`);
	}

	public addColumn(table: string, column: SchemaFolder | SchemaEntry) {
		const escapedTable = cIdentifier(table);
		const columns = (column instanceof SchemaFolder ? [...column.values(true)] : [column])
			.map(subpiece => `ADD COLUMN ${this.qb.generateDatatype(subpiece)}`).join(', ');
		return this.run(/* sql */`
			ALTER TABLE ${escapedTable} ${columns};
		`);
	}

	public removeColumn(table: string, columns: string | string[]) {
		const escapedTable = cIdentifier(table);
		const escapedColumns = typeof columns === 'string' ? cIdentifier(columns) : columns.map(cIdentifier).join(', ');
		return this.run(/* sql */`
			ALTER TABLE ${escapedTable}
			DROP COLUMN ${escapedColumns};
		`);
	}

	public updateColumn(table: string, entry: SchemaEntry) {
		const [column, datatype] = this.qb.generateDatatype(entry).split(' ');
		const defaultConstraint = entry.default === null
			? ''
			: `, ALTER COLUMN ${column} SET NOT NULL, ALTER COLUMN ${column} SET DEFAULT ${this.qb.serialize(entry.default, entry)}`;

		return this.pgsql!.query(/* sql */`
			ALTER TABLE ${cIdentifier(table)}
			ALTER COLUMN ${column}
			TYPE ${datatype}${defaultConstraint};`);
	}

	public async getColumns(table: string, schema = 'public') {
		const result = await this.runAll(/* sql */`
			SELECT column_name
			FROM information_schema.columns
			WHERE
				table_schema = ${cString(schema)} AND
				table_name = ${cString(table)};
		`);
		return result.map(row => row.column_name);
	}

	public run<T extends Submittable>(queryStream: T): T;
	public run<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>>;
	public run(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		return this.pgsql!.query(...sql);
	}

	public async runAll<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows']>;
	public async runAll(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows;
	}

	public async runOne<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows'][number]>;
	public async runOne(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows[0] || null;
	}

}

function cIdentifier(identifier: string) {
	const escaped = identifier.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	return `"${escaped}"`;
}

function cString(value: string) {
	const escaped = value.replace(/'/g, "''");
	return `'${escaped}'`;
}

function cJson(value: AnyObject) {
	const escaped = cString(JSON.stringify(value));
	return `${escaped}::JSON`;
}

function cArrayJson(value: AnyObject[]) {
	return `ARRAY[${value.map(json => cString(JSON.stringify(json)))}]::JSON[]`;
}

function makeRange(values: number) {
	if (values <= 0) throw new Error(`Invalid range ${values}`);
	if (values === 1) return '$1';

	let indexPlaceholders = '$1';
	for (let i = 1; i < values; ++i) {
		indexPlaceholders += `, $${i + 1}`;
	}
	return indexPlaceholders;
}

type CreateOrUpdateValue = SettingsFolderUpdateResult[] | [string, unknown][] | Record<string, unknown>;
